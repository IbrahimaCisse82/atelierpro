import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the calling user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: authError } = await userClient.auth.getUser();
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller is owner
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerProfile } = await adminClient
      .from("profiles")
      .select("company_id")
      .eq("user_id", caller.id)
      .single();

    if (!callerProfile?.company_id) {
      return new Response(JSON.stringify({ error: "Profil introuvable" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: callerRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("company_id", callerProfile.company_id)
      .single();

    if (!callerRole || callerRole.role !== "owner") {
      return new Response(JSON.stringify({ error: "Seul le propriétaire peut inviter" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, firstName, lastName, role } = await req.json();

    if (!email || !firstName || !lastName || !role) {
      return new Response(JSON.stringify({ error: "Champs requis manquants" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validRoles = ["manager", "tailor", "orders", "stocks", "customer_service"];
    if (!validRoles.includes(role)) {
      return new Response(JSON.stringify({ error: "Rôle invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create user with admin API (won't affect caller's session)
    const tempPassword = crypto.randomUUID().slice(0, 16) + "A1!";
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // The trigger will have created a new company for this user.
    // We need to reassign them to the caller's company.
    const companyId = callerProfile.company_id;

    // Update profile to caller's company
    await adminClient
      .from("profiles")
      .update({ company_id: companyId })
      .eq("user_id", newUser.user!.id);

    // Update role to the selected one and correct company
    await adminClient
      .from("user_roles")
      .update({ company_id: companyId, role: role as any })
      .eq("user_id", newUser.user!.id);

    // Clean up the orphan company created by the trigger
    const { data: orphanProfile } = await adminClient
      .from("companies")
      .select("id")
      .eq("email", email)
      .neq("id", companyId);

    if (orphanProfile && orphanProfile.length > 0) {
      for (const orphan of orphanProfile) {
        await adminClient.from("companies").delete().eq("id", orphan.id);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Utilisateur ${firstName} ${lastName} ajouté avec le rôle ${role}`,
        tempPassword,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
