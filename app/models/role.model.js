module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define('roles', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING
        },

        role_type: {
            type: Sequelize.STRING
        }
    })
    return Role;
}