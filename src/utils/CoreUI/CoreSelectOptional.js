import { CFormGroup, CFormText, CLabel } from '@coreui/react'
import { Field, useField } from 'formik'
import React from 'react'

function CoreSelectOptional(props) {
    const [field,meta] = useField(props)
    const {label,name,id,options,isRequired,typeOfOption,readOnly, ...rest } = props
    return (
        <div>

            <Field name={name}>
            {
                ({field,form})=>{
                    
                    return <CFormGroup >
                    <CLabel htmlFor={name}>{label}</CLabel>
                    { isRequired && (<span style={{color:"red",fontSize:"1rem",paddingLeft:"2px"}}> *</span>) }
                    {
                       
                            <select
                            className="form-control form-select"
                            disabled={readOnly}
                            id={id}
                            {...rest}
                            {...field}
                          > 
                         
                                 {
                                  options.map( item=>{
                                      return (
                                        <option key={item.value} value={item.id} >{item.value}</option>
                                      
                                      )
                                  })
                                 }
                          </select>      
                    }         
                    { meta.touched &&  <CFormText className="help-block error">
                      {form.errors[name]}
                    </CFormText>}
                  </CFormGroup>

                }
            }
        </Field>
           
        </div>
    )
}

export default CoreSelectOptional
