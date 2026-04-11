import supabase from "../supabaseClient.js";

//================================== ADMIN API ROUTE ====================================

/**
 * Feteches all orgs for the admin panel -- `route is admin/users`
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
 * Fetches all students for the admin panel -- `route is admin/students`
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
 * Fetches all opportunities for the admin panel -- `route is admin/students`
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
 * Updates the verification status of an org -- `route is admin/verify/`
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
 * Checks whether the passed in id is an org or not - `path is admin//organization/:id`
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
 * Deletses an org given the id - `admin/organization/:id`
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
 * Soft delete for opportunities - `admin//opportunity/:id/close`
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
 * delete opp - `admin/opportunity/:id`
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

//=================================== OPPORTUNITY API ROUTES ======================================


/**
 * Fetches all the public opportunities that are verified - `the route is /`
 * 
 * @returns {Promise<Array>} of verified opportunities
 */
export const getPublicOpportunities = async () => {
    const {data: opportunities, error } = await supabase
    .from("opportunities")
    .select("*, users(name, verified)")
    .eq("status", "active");

    if (error) throw error;

    const verified = opportunities.filter(
        (opp) => opp.users?.verified === true || opp.users?.verified === "verified"
      );

    return verified;
}


/**
 * Fetches the opprotunities of a specific org
 * @param {String} org_id - org ID from our DB
 * @returns {Promise<Array>} of opportunities from a specific org
 */
export const getOrgOpportunities = async (org_id) => {   
    const {data: opportunities, error } = await supabase
    .from("opportunities")
    .select("*, users(name, verified)")
    .eq("org_id", org_id)
    .eq("status", "active");

    if (error) throw error;

    return opportunities;
}


/**
 * Fetches a single opportunity based on id
 * @param {String} id - id of the opportunity
 * @returns {Promise<Object>} opportunity object
 */
export const getOpportunity = async (id) => {
    const {data: opportunity, error } = await supabase
    .from("opportunities")
    .select("*, users(name, verified)")
    .eq("id", id)
    .maybeSingle();

    if (error) throw error;
    if (!opportunity) throw new Error("Opportunity not found");

    return opportunity;
}

/**
 * Creates an opportunity for an org
 * @param {string} org_id 
 * @param {Object} opportunityData - opportunity fields (title, description, etc.)
 * @returns {Promise<Object>} created opportunity
 */
export const createOpportunity = async (org_id, opportunityData) => {
    const { data: opportunity, error } = await supabase
        .from("opportunities")
        .insert([{ ...opportunityData, org_id, status: "active" }])
        .select()
        .single();

    if (error) throw error;
    return opportunity;
}

/**
 * Updates a specific opportunity
 * @param {string} opportunityID - opportunity ID
 * @param {Object} opportunityData - the updated fields for the opportunity
 * @returns {Promise<Object>} updated opportunity
 * TODO: COME BACK AND ADD THE OWNERSHIP CHECK LIKE WE DID IN DELETEOPPORTUNITY()
 */
export const updateOpportunity = async (opportunityID, opportunityData) => {
    const { data: opportunity, error }  = await supabase
    .from("opportunities")
    .update({... opportunityData})
    .eq("id", opportunityID)
    .select()
    .maybeSingle();   

  if (error) throw error;

  if (!opportunity) throw new Error("Opportunity not found");

  return opportunity; 
}

/**
 * Deletes an opportunity
 * @param {string} id - opportunity id
 * @param {string} org_id  - ID of the org trying to delete the opportunity
 */
export const deleteOpportunity = async (id, org_id) => {
    const { data, error } = await supabase
        .from("opportunities")
        .delete()
        .eq("id", id)
        .eq("org_id", org_id)
        .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Opportunity not found or unauthorized");
};

//=================================== ORGANIZATIONS.JS API ROUTES ======================================

/**
 * Fetches all verified orgs - path is `get /`
 * @returns {Promise<Array>} - verified orgs in the DB
 */
export const getVerifiedOrgs = async () => {
    const { data: orgs, error } = await supabase
    .from("users")
    .select("id, name, email, org_description, website, verified, banner_url")
    .eq("role", "org")
    .eq("verified", "verified")

    if (error) throw error;

    return orgs;
}

/**
 * Fetches org info for their dashboard - path is '`get /private`
 * @param {string} userId - the id of the org trying to reach their dashboard
 * @returns {Promise<Object>} - the org info
 */
export const getOrgForDashboard = async (userId) => {

    const { data: org, error } = await supabase
    .from("users")
    .select("id, name, email, org_description, website, verified, banner_url")
    .eq("id", userId)
    .maybeSingle();

    if (error) throw error;

    if (!org) throw new Error("Org was not found");
    
    return org
}

/**
 * Updates the orgs details for profile - path is `put /:id`
 * @param {string} orgId - the id of the org
 * @param {Object} orgData - the new info for the org
 * @returns {Promise<Object>} updated org object
 */
export const updateOrg = async (orgId, orgData) => {
    const { data: org, error } = await supabase
    .from("users")  
    .update({ ...orgData })
    .eq("id", orgId)
    .eq("role", "org")  // Added safety check
    .select()
    .maybeSingle();

    if (error) throw error;

    return org;
}

//=================================== REVIEWS.JS API ROUTES ======================================

/**
 * Fetches the review of an org - path is `get /org/:orgId`
 * @param {string} orgId - the id for reviews from the org that we want
 * @returns {Promise<Array>} array of reviews for the org
 */

export const getOrgReviews = async (orgId) => {
    const {data: reviews, error } = await supabase
    .from("reviews")
    .select("*, opportunities!inner(org_id, title)")
    .eq("opportunities.org_id", orgId);

    if (error) throw error;

    return reviews; 
}