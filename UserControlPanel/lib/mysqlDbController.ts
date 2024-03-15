import pool from "./mysqlDb";

export default class DatabaseController {

    public static async selectQuery<T>(queryString: string, values: any[] = []): Promise<T> {
        console.log(`[MYSQL] SELECT Query [${queryString}] was executed with values ${values}`);

        const [results] = await pool.promise().execute(queryString, values);

        return results as T;
    }

    public static async updateQuery(queryString: string, values: any[] = []) {
        console.log(`[MYSQL] UPDATE Query [${queryString}] was executed with values ${values}`);

        await pool.promise().execute(queryString, values);
    }

    public static async insertQuery(queryString: string, values: any[] = []) {
        console.log(`[MYSQL] INSERT Query [${queryString}] was executed with values ${values}`);

        await pool.promise().execute(queryString, values);
    }
}