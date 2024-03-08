import pool from "./mysqlDb";

export default class DatabaseController {

    public static async selectQuery<T>(queryString: string, values: string[]): Promise<T> {
        console.log(`[MYSQL] Query [${queryString}] was executed with values ${values}`);

        const [results] = await pool.promise().execute(queryString, values);

        return results as T;
    }

}