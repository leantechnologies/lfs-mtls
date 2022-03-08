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
    delete headers['content-length']
    delete headers['transfer-encoding']
    delete headers['accept']
    delete headers['content-type']
    delete headers['connection']
    delete headers['host']
    // @ts-ignore
    const axiosReq = axios({
      url: `https://api.leantech.me${originalUrl}`,
      method: method as Method,
      data: body,
      params,
      headers: { ...headers, Host: 'api.leantech.me' },
      query,
      httpsAgent: agent,
    })
    const { status, data, headers: responseHeaders } = await axiosReq
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
