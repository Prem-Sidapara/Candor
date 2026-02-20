import { supabase } from "./supabase";


async function getOrCreateUser() {

    let token = localStorage.getItem("candor_token");

    if (!token) {
        token = crypto.randomUUID();

        const { data, error } = await supabase
            .from("anonymous_users")
            .insert({ secret_token: token })
            .select()
            .single();

        if (error) {
            throw new Error('Failed to create user ' + error.message);
        }

        localStorage.setItem('candor_token', token)

        return { id: data.id, token };
    }
    else {

        const { data, error } = await supabase
            .from('anonymous_users')
            .select('id')
            .eq('secret_token', token)
            .single();

        if (error) {
            throw new Error('User not found ' + error.message);
        }

        return { id: data.id, token }
    }
}

export default getOrCreateUser; 