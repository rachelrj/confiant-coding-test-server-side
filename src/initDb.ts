import {DataTypes, Model, Sequelize} from 'sequelize';
import {dbFilePath} from "./env.js";

class Search extends Model {}

async function initDb() {
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: dbFilePath,
    });

    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

    // Sequelize automatically adds the fields createdAt and updatedAt
    // to every model, using the data type DataTypes.DATE.
    Search.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        clientIp: DataTypes.STRING,
        search: DataTypes.STRING,
    }, { sequelize, modelName: 'search' });
    await Search.sync();
    return sequelize;
}

export const initializeDb = initDb, SearchRecord = Search;