import React, { Component } from "react";
import Joi from "joi-browser";
import { saveCorrelationinformation, getCorrelationinformation } from "../../services/correlationinformationService";

class createCorrelationinformation extends Component{

 constructor(props){
super(props);
}  state = {
    data: { RequestingDocumentCreationDateTime: "", RequestingDocumentInstanceIdentifier: "", ExpectedResponseDateTime: "", },
    errors: {}
  };

  scheema = {
    _id: Joi.string(),
    RequestingDocumentCreationDateTime:  Joi.date()
      .allow('').allow(null)



      .label("RequestingDocumentCreationDateTime"),
    RequestingDocumentInstanceIdentifier:  Joi.string()
      .allow('').allow(null)



      .label("RequestingDocumentInstanceIdentifier"),
    ExpectedResponseDateTime:  Joi.date()
      .allow('').allow(null)



      .label("ExpectedResponseDateTime"),
    createdAt: Joi.date()
      .label("createAt")
  };

  async populateForm() {
    try {
      const correlationinformationId = this.props.match.params.id;
      if(correlationinformationId!=="new"){
        const { data } = await getCorrelationinformation(correlationinformationId);
        this.setState({ data });
      }    
    } 
    catch (ex) {
      if (ex.response && ex.response.status === 404) {
        this.props.history.replace("/not-found"); 
      }
    }
  }

  async componentDidMount() {
    await this.populateForm();
  }


  validate = () => {
    const result = Joi.validate(this.state.data, this.scheema, {
      abortEarly: false
    });
    if (!result.error) return null;
    const errors = {};
    for (let item of result.error.details) {
      errors[item.path[0]] = item.message;
    }
    return errors;
  };

  validateProperty = inputField => {
    const { name, value } = inputField;
    const obj = { [name]: value };
    const scheema = { [name]: this.scheema[name] };
    const result = Joi.validate(obj, scheema);
    return result.error ? result.error.details[0].message : null;
  };

  handleChange = event => {
    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(event.currentTarget);
    if (errorMessage) errors[event.currentTarget.name] = errorMessage;
    else delete errors[event.currentTarget.name];

    const data = { ...this.state.data };
    data[event.currentTarget.name] = event.currentTarget.value;

    this.setState({ data: data, errors: errors });
  };
  handleSubmit = async (event) => {
    event.preventDefault();
    const errors = this.validate();
    this.setState({ errors: errors ? errors : {} });
    if (errors) return;
    await saveCorrelationinformation(this.state.data);
    this.props.history.push("/correlationinformations");
  };

  render() {
    return (
      <div className="content">
        <h1>Correlationinformation Form</h1>
        <form onSubmit={this.handleSubmit}>

          <div className="form-group">
              <label htmlFor="RequestingDocumentCreationDateTime"> Requesting Document Creation Date Time</label>
              <input
                value={this.state.data["RequestingDocumentCreationDateTime"].substring(0, 10)}
                onChange={this.handleChange}
                name="RequestingDocumentCreationDateTime"
                id="RequestingDocumentCreationDateTime"
                type="date"
                className="form-control"
              />
              {this.state.errors["RequestingDocumentCreationDateTime"] && <div className="alert alert-danger">{this.state.errors["RequestingDocumentCreationDateTime"]}</div>}
          </div>

          <div className="form-group">
              <label htmlFor="RequestingDocumentInstanceIdentifier"> Requesting Document Instance Identifier</label>
              <input
                value={this.state.data["RequestingDocumentInstanceIdentifier"]}
                onChange={this.handleChange}
                name="RequestingDocumentInstanceIdentifier"
                id="RequestingDocumentInstanceIdentifier"
                type="text"
                className="form-control"
              />
              {this.state.errors["RequestingDocumentInstanceIdentifier"] && <div className="alert alert-danger">{this.state.errors["RequestingDocumentInstanceIdentifier"]}</div>}
          </div>

          <div className="form-group">
              <label htmlFor="ExpectedResponseDateTime"> Expected Response Date Time</label>
              <input
                value={this.state.data["ExpectedResponseDateTime"].substring(0, 10)}
                onChange={this.handleChange}
                name="ExpectedResponseDateTime"
                id="ExpectedResponseDateTime"
                type="date"
                className="form-control"
              />
              {this.state.errors["ExpectedResponseDateTime"] && <div className="alert alert-danger">{this.state.errors["ExpectedResponseDateTime"]}</div>}
          </div>

          <button disabled={this.validate()} className="btn btn-primary custom-btn">Save</button>

        </form>
      </div>
    );
  }
}

export default createCorrelationinformation;