import React from 'react';
import { Field } from 'formik';

export default function KeyValueTemplate(props) {
  const data = props.data;
  const contentArray = props.contentArray;

  return (
    <div className='tab-content'>
      {data.map((info, index) => {
        return (
          <div key={index} className='input-group my-2'>
            <Field
              placeholder='Key'
              className='border-1 rounded-lg px-2 col'
              name={`data.${index}.key`}
              type='input'
            />
            <Field
              placeholder='Value'
              className='border-1 rounded-lg px-2 col'
              name={`data.${index}.value`}
              type='input'
            />
            <button
              className='btn btn-outline-danger px-4'
              onClick={() => contentArray.remove(index)}
            >
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
}
