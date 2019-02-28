console.log('Starting App');
//greetV1 lambda
exports.handler = async (event) => {
    var eventMsg = event;
    const response = {
        statusCode: 200,
        body: JSON.stringify(`${eventMsg} from Capgemini `), //event from previous lambda
        
    };
    
    console.log(event);
    
    var datetime = new Date();
    console.log('Inside handler');
    console.log('Last Executed: ',datetime);
    
    return response;
};
