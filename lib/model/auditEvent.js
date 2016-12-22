/**
 * Created by bchan on 4/8/16.
 */
var mongoose            = require('mongoose'),
    Schema              = mongoose.Schema;
    
var AuditEventSchema = new Schema({
    username: { type: String}, 
    eventType: { type: String},
    eventDate: { type: Date},
    data: { 
        request : { 
            originalUrl : {type : String},
            baseUrl : {type : String},
            path : {type : String},
            method : {type : String},
            params : [{ }],
            query : {type : Object},
            body : {type : Object},
            hostname : {type : String},
            remoteIPAddress : {type : String}
        },
        response: {
           status : {type : String},
           message : {type : String}
        }
    }
}, { collection: 'AuditEvent' });

module.exports = mongoose.model('AuditEvent', AuditEventSchema);