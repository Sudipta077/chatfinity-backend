import  {Kafka} from 'kafkajs';
import fs from 'fs'
import path from 'path';
import {sendMessage}  from '../controller/messageController.js';
import dotenv from 'dotenv';
dotenv.config();
const kafka = new Kafka({
    brokers:[`${process.env.KAFKA_BROKER}`],
    ssl:{
        ca:[fs.readFileSync(path.resolve('./ca.pem'),"utf-8")]
    },
    sasl:{
        username:`${process.env.KAFKA_USERNAME}`,
        password:`${process.env.KAFKA_PASSWORD}`,
        mechanism:'plain'
    }
})
let producer = null;
export async function createProducer(){
    
    if(producer) return producer;
    
    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer;
    return producer;
}

export async function produceMessage(data){
    const producer = await createProducer();
    console.log("message got in producer--.",data);
    await producer.send({
        messages:[{key:`message-${Date.now()}`,value:JSON.stringify(data)}],
        topic:"MESSAGES",
    });
    return true;
}

export async function startMessageConsumer(){
    const consumer  = kafka.consumer({groupId:'default'});
    await consumer.connect();
    await consumer.subscribe({topic:'MESSAGES',fromBeginning:true});
    await consumer.run({
        autoCommit:true,
        eachMessage:async({message,pause})=>{
            const decoded = JSON.parse(message.value.toString())
            // console.log("New message rcvd at kafka consumer--->",decoded);

            try{
                   const {error,result} = await sendMessage(decoded);
                   if (error) {
                    console.log("Failed to save message:", error);
                    return {error:error};
                } else {
                    // console.log("Saved message:", message);
                    // console.log("after storing msg from kfka consumer to db --->",result);
                    return {result:result};
                }

            }
            catch(err){
                console.log("Error occurred while storing message in db from kafka consumer -->",err);
                return err;
            }
        }
    })
}