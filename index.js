
var AWS = require('aws-sdk');
AWS.config.update({region: 'ap-south-1'});
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
var queueURL = "https://sqs.ap-south-1.amazonaws.com/639670040330/SNSMessageQueue";
var lambda = new AWS.Lambda({
    region:  'ap-south-1'
});

var params ={
    
    MaxNumberOfMessages: 1,
    QueueUrl : queueURL,
    VisibilityTimeout: 0,
    WaitTimeSeconds: 0

};
// Invoke greetHello Lambda That Takes Messages from SQS
exports.handler = (event, context, callback)=>{
    console.log('Inside Handler');
    var response={};

    sqs.receiveMessage(params, function(err,data){
        console.log("data: ", JSON.stringify(data));

        if(err){
            console.log("Error : ", err);
            callback(err,"Error Feching from SQS");
        }
        else if(data.Messages){
            console.log("Number of Message Received: ",data.Messages.length);
            console.log("Received Message: " ,JSON.stringify(data.Messages[0]));
            var message = JSON.parse(data.Messages[0].Body);
            
            var greet = `Greet: ${message.Message} ${message.MessageAttributes.name.Value}`;
            console.log(greet);
            
            //Invoking Another Lambda That return Final Response
            lambda.invoke({
                FunctionName: "greetV2",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(greet, null, 2) 
            },function(err,data){
                console.log('Inside Lambda Invoke');
                if(err){
                    console.log(err);
                    context.done('error: ',err);
                }
                else if(data.Payload){
                    console.log(data.Payload);
                    callback(null,JSON.parse(data.Payload));
                }
                else{
                    console.log(data);
                }
               
            }); 
            
            
            var deleteParams = {
                QueueUrl: queueURL,
                ReceiptHandle: data.Messages[0].ReceiptHandle
            };

            sqs.deleteMessage(deleteParams, function(err,data){
                if(err){
                    console.log("Delete error", err);
                }else{
                    console.log("Message Deleted", data);
                }
            });
        }
        else{
            console.log("No Messages received");
        }
        
    });
};