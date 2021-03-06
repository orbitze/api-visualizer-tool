import React, { useState } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import prettyBytes from 'pretty-bytes';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';
import KeyValueTemplate from './KeyValueTemplate';
import 'bootstrap/dist/css/bootstrap.min.css';

function DataForm() {
  const [status, setStatus] = useState(0);
  const [time, setTime] = useState(0);
  const [size, setSize] = useState(0);
  const [response, setResponse] = useState({}); 
  const [responseHeaders, setResponseHeaders] = useState({});
  const [json, setJSON] = useState({});

  axios.interceptors.request.use((request) => {
    request.customData = request.customData || {};
    request.customData.startTime = new Date().getTime();
    return request;
  });

  function updateEndTime(response) {
    if (response !== undefined) {
      response.customData = response.customData || {};
      response.customData.time = new Date().getTime() - response.config.customData.startTime;
      return response;
    }
  }

  axios.interceptors.response.use(updateEndTime, (e) => {
    return Promise.reject(updateEndTime(e.response));
  });

  function keyValuePairsToObjects(container) {
    var params = {};
    container.forEach((data) => {
      params[data['key']] = data['value'];
    });

    return params;
  }

  const sendRequest = (data) => {
    let dataJson;
    try {
      dataJson = json;
    } catch (e) {
      alert('JSON data is malformed');
      return;
    }
    axios({
      url: data.url,
      method: data.method,
      params: keyValuePairsToObjects(data.query_data),
      headers: keyValuePairsToObjects(data.header_data),
      dataJson,
      validateStatus: () => true,
    })
      .catch((e) => console.log(e))
      .then((response) => {
        if (response !== undefined) {
          setStatus(response.status);
          setResponse(response.data);
          setResponseHeaders(response.headers);
          setTime(response.customData.time);
          setSize(
            prettyBytes(
              JSON.stringify(response.data).length + JSON.stringify(response.headers).length
            )
          );
        }
      });
  };

  return (
    <div className='p-4'>
      <div>
        <Formik
          initialValues={{
            url: 'https://jsonplaceholder.typicode.com/todos/',
            query_data: [{}],
            header_data: [{}],
            method: 'GET',
          }}
          onSubmit={(details) => {
            sendRequest(details);
          }}
        >
          {({ values }) => (
            <Form>
              <div className='form-group'>
                <div className='input-group mb-4 '>
                  <Field
                    name='method'
                    className='method form-select flex-grow-0 w-auto'
                    as='select'>
                    <option value='GET'>GET</option>
                    <option value='POST'>POST</option>
                    <option value='PUT'>PUT</option>
                    <option value='PATCH'>PATCH</option>
                    <option value='DELETE'>DELETE</option>
                  </Field>
                  <Field
                    name='url'
                    type='url' required
                    className='form-control'
                    placeholder='https://www.example.com' />
                  <div className='form-group'>
                    <button className='btn btn-primary px-4' type='submit'>
                      Send
                    </button>
                  </div>
                </div>
              </div>

              <Tabs defaultActiveKey='query-params' className='nav nav-tabs'>
                <Tab eventKey='query-params' title='Query Params' className='tab-content p-3 border-top-0 border'>
                  <FieldArray name='query_data'>
                    {(queryArray) => (
                      <KeyValueTemplate
                        data={values.query_data}
                        contentArray={queryArray}
                      />
                    )}
                  </FieldArray>
                  <div className='form-group'>
                    <button type='submit' className='mt-2 btn btn-outline-success mr-auto' onClick={() => values.query_data.push({})} >
                      Add
                    </button>
                  </div>
                </Tab>
                <Tab eventKey='headers' title='Headers' className='tab-content p-3 border-top-0 border'>
                  <FieldArray name='header_data'>
                    {(headersArray) => (
                      <KeyValueTemplate
                        data={values.header_data}
                        contentArray={headersArray}
                      />
                    )}
                  </FieldArray>
                  <div className='form-group'>
                    <button type='submit' className='mt-2 btn btn-outline-success mr-auto' onClick={() => values.header_data.push({})} >
                      Add
                    </button>
                  </div>
                </Tab>
                <Tab eventKey='json' title='JSON'>
                  <JSONInput
                    id='json_input'
                    theme='dark_vscode_tribute'
                    // colors={{
                    //   string: 'red',
                    //   background: '#FCFDFD'
                    // }}
                    locale={locale}
                    onChange={(data) => setJSON(data.jsObject)}
                    height='25vh'
                    width='100%'
                    style={{ body: { fontSize: '1em', },  }}
                  />
                </Tab>
              </Tabs>
            </Form> 
          )}
        </Formik>
      </div>
      <div className='mt-5'>
        <h4>Response</h4>
        <div className='d-flex my-2'>
          <div className='me-3'>Status: {status}</div>
          <div className='me-3'>Time: {time} ms</div>
          <div className='me-3'>Size: {size}</div>
        </div>
        <div>
          <Tabs
            defaultActiveKey='body'
            id='uncontrolled-tab-example'
            className='nav nav-tabs'
          >
            <Tab eventKey='body' title='Body'>
              <pre className='scroll'>
                {JSON.stringify(response, null, 2)}
              </pre>
            </Tab>
            <Tab eventKey='response' title='Response'>
              <pre>{JSON.stringify(responseHeaders, null, 2)}</pre>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default DataForm;
