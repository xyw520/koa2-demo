const sha1 = require('sha1')
const getRawBody = require('raw-body')
const util = require('./util')
module.exports = (opts) => {
    return async (ctx, next) => {
        const {
            signature,
            timestamp,
            nonce,
            echostr
        } = ctx.query

        const token = opts.token
        let str = [token, timestamp, nonce].sort().join('')
        const sha = sha1(str)

        if (ctx.method === 'GET') {
            if (sha === signature) {
                ctx.body = echostr
            } else {
                ctx.body = 'failed'
            }
        } else if (ctx.method === 'POST') {
            if (sha !== signature) {
                return (ctx.body = 'failed')
            }

            const data = await getRawBody(ctx.req, {
                length: ctx.length,
                limit: '1mb',
                encoding: ctx.charest
            })
            console.log("data")
            console.log(data)

            const content = await util.parseXML(data)
            console.log("content")
            console.log(content)
            const message = util.formatMessage(content.xml)
            console.log("message")
            console.log(message)
            ctx.status = 200
            ctx.type = 'application/xml'

            const xml = `<xml>  
            <ToUserName>
                <![CDATA[${message.FromUserName}]]>
            </ToUserName>  
            <FromUserName>
                <![CDATA[${message.ToUserName}]]>
            </FromUserName> 
            <CreateTime>
                ${parseInt(new Date().getTime() / 1000, 0) + ""}
            </CreateTime>  
            <MsgType><![CDATA[text]]></MsgType>  
            <Content><![CDATA[${message.Content}]]></Content>  <MsgId>1234567890123456</MsgId>  
            </xml>`



            console.log("xml")
            console.log(xml)
            ctx.body = xml

        }



    }
}