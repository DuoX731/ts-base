import database from "../database/connection"

/**
 * Sample Usage:
 * transactionWrapper(User.find({}));
 * transactionWrapper(User.create({}));
 */
export const transactionWrapper = async (operation: any) => {
    const connection = database.getConnection();
    if(!connection) {
        return await operation();
    }
    const session = await connection.startSession();

    try {
        await session.withTransaction(async () => {
            await operation();
        });

        await session.commitTransaction();
        await session.endSession();
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        throw error;
    }
}