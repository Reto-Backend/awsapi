const AWS=require('aws-sdk');
const db=new AWS.DynamoDB.DocumentClient();
const uuid=require('uuid');
const taskTable=process.env.TASK_TABLE;

const sortByDate=(a,b)=>{
  if(a.created_At>b.created_At){
    return -1
  }
  return 1;
}


const response=(statusCode,message)=>{
  return {
    statusCode:statusCode,
    body:JSON.stringify(message)
  }
}

module.exports.createTask=(event,context,callback)=>{
  if(!body.title || body.title.trim()===''){
    return callback(null,response(400,{error:'La tarea debe tener un titulo y no debe estar vacia'}))
  }
  const body=JSON.parse(event.body);
  const task={
    id:uuid(),
    created_At:new Date().toString(),
    title:body.title
  }
  return db.put({
    TableName:taskTable,
    Item: task
  }).promise().then(()=>{
    callback(null,response(201,task))
  }).catch(err=>response(null,response(err.statusCode,err)))
}

module.exports.getAllTasks=(event,context,callback)=>{
  return db.scan({
    TableName:taskTable
  }).promise().then(res=>{
    callback(null,res.Items.sort(sortByDate))
  }).catch(err=>callback(null,response(err.statusCode,err)));
}

module.exports.getTask=(event,context,callback)=>{
  const id=event.pathParameters.id;
  const params={
    Key:{
      id
    },
    TableName:taskTable
  }

  return db.get(params).promise()
  .then(res=>{
    if(res.Item){
      return callback(null,response(200,res.Item))
    }
    callback(null,response(400,{error:'Tarea no encontrada'}))
  }).catch(err=>callback(null,response(err.statusCode,err)))


}

module.exports.updateTask=(event,context,callback)=>{
  const id=event.pathParameters.id;
  const body=JSON.parse(event.body);
  const paramName=body.paramName;
  const paramValue=body.paramValue;
  const params={
    Key:{
      id
    },
    TableName:taskTable,
    ConditionExpression: 'attribute_exists(id)',
    UpdateExpression: 'set'+paramName+ '= :v',
    ExpressionAttributeValues:{
      ':v':paramValue
    },
    ReturnValue:'ALL_NEW'
  }


  return db.update(params).promise()
  .then(res=>{
    callback(null,response(200,res))
  }).catch(err=>callback(null,response(err.statusCode,err)));

}


module.exports.deleteTask=(event,context,callback)=>{
  const id=event.pathParameters.id;
  const params={
    Key:{
      id
    },
    TableName:taskTable
  }

  return db.delete(params).promise()
  .then(res=>  callback(null,response(400,{error:'Tarea eliminada'}))).catch(err=>callback(null,response(err.statusCode,err)))

}

