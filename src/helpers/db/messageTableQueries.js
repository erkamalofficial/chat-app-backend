

const createNewMessage = async ({ sender, receiver, message }) => {
    try {
        const currentDateTime = new Date().toISOString()
        const [result] = await MySqlQuery(`INSERT INTO ellotdb.messages VALUES ('${uuid()}', '${message}', '', '${currentDateTime}')`);
    } catch (error) {
        
    }
   
}