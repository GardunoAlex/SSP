import supabase from "../supabaseClient.js";

//================================== ADMIN API ROUTE ====================================

/**
 * Feteches all orgs for the admin panel -- route is admin/users
 * TODO: Need to come back and check the route too see where it's being used in the frontend
 * to see if we might change to all users instead of orgs -- based on the name of the route
 * @returns {Promise<Array>} of orgs
 */
export const getOrgs = async () => {
    const { data: orgs, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "org");

    if (error) throw error;

    return orgs;
};


/**
 * Fetches all students for the admin panel -- route is admin/students
 * @returns {Promise<Array>} of students
 */
export const getStudents = async () => {
    const { data: students, error } = await supabase
    .from("users")
    .select("id, name, email, role, created_at")
    .eq("role", "student")

    if (error) throw error;

    return students
}


/**
 * Fetches all opportunities for the admin panel -- route is admin/students
 * @returns {Promise<Array>} of opportunities
 */
export const getOpportunities = async () => {
    const { data: opportunities, error } = await supabase
    .from("opportunities")
    .select("*, users(name, email, role,verified)")
    .order("created_at", {ascending: false})

    if (error) throw error;

    return opportunities;
}


/**
 * Updates the verification status of an org -- route is admin/verify/
 * @param {String} id - the orgs id
 * @param {String} status - the orgs verification status
 * @returns 
 */
export const modifyOrgVerification = async (id, status) => {
    const { data, error } = await supabase
    .from("users")
    .update({ verified: status })
    .eq("id", id)
    .select();

    if (error) throw error;

    return data;
}


/**
 * Checks whether the passed in id is an org or not - path is admin//organization/:id
 * @param {String} id - the id for the org
 * @returns the org/not the org
 */
export const orgCheck = async (id) => {
    const { data: org, error } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", id)
    .eq("role", "org")
    .single();

    if (error || !org ) {
        throw error;
    }

    return org;
}


/**
 * Deletses an org given the id - admin/organization/:id
 * @param {String} id - the id of the org to delete
 */
export const deleteOrg = async (id) => {
    const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id);

    if (error) throw error; 
}

/**
 * Soft delete for opportunities - admin//opportunity/:id/close
 * @param {String} id - id for the opportunity that we want to close
 */
export const oppSoftDelete = async (id) => {
    const { data, error } = await supabase
    .from("opportunities")
    .update({ status: "closed" })
    .eq("id", id)
    .select();

    if (error) throw error;

    if (!data || data.length === 0) throw new Error("Opportunity not found");
};

/**
 * delete opp - admin/opportunity/:id
 * @param {String} id - id of opp we want to delete
 */
export const oppDelete = async (id) => {
    const { data, error } = await supabase
        .from("opportunities")
        .delete()
        .eq("id", id)
        .select();

    if (error) throw error;

    if (!data || data.length === 0) throw new Error("Opportunity not found");
};