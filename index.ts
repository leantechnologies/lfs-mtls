import express from 'express'
import axios, { AxiosError, Method } from 'axios'
import { Agent } from 'https'
import fs from 'fs'
const agent = new Agent({
  cert: fs.readFileSync('certs/cert.crt'),
  key: fs.readFileSync('certs/key.pem'),
  ca: fs.readFileSync('certs/ca.pem'),
})
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.all('*', async (req, res) => {
  try {
    const { headers, body, params, query, method, originalUrl } = req
    const { region, sandbox, mtls } = headers;
    const mtlsValue = (mtls as string).toLowerCase() === 'true'
    const sandboxValue = (sandbox as string).toLowerCase() === 'true'
    const host = `${mtlsValue && sandboxValue ? 'mtls.' : ''}${sandboxValue ? 'sandbox' : 'api'}${region === 'ksa' ? '.sa' : ''}.leantech.me`
    delete headers['content-length']
    delete headers['transfer-encoding']
    delete headers['accept']
    delete headers['content-type']
    delete headers['connection']
    delete headers['host']
    delete headers['region']
    delete headers['sandbox']
    delete headers['mtls']
    // @ts-ignore
    const axiosReq = axios({
      url: `https://${host}${originalUrl}`,
      method: method as Method,
      data: body,
      headers: { ...headers, host },
      httpsAgent: agent,
    })
    const { status, data, headers: responseHeaders } = await axiosReq
    delete responseHeaders['transfer-encoding']
    return res
      .set({ ...responseHeaders })
      .status(status)
      .send(data)
  } catch (err) {
    const error = err as Error | AxiosError
    if (!axios.isAxiosError(error) || !error.response) {
      console.error(error)
      return res.status(500).json({ error: true, msg: 'NON API ERROR' })
    }
    const axiosError = error as AxiosError
    return res
      .set({ ...axiosError?.response?.headers })
      .status(axiosError?.response?.status as number)
      .send(axiosError?.response?.data)
  }
})

app.listen(8080, () => {
  console.log('lean forward service (mtls) running on port 8080')
})
