import React, { Component } from "react";
import Joi from "joi-browser";
import { saveIndividualreturnableassetidentification, getIndividualreturnableassetidentification } from "../../services/individualreturnableassetidentificationService";

class createIndividualreturnableassetidentification extends Component{

 constructor(props){
super(props);
}  state = {
    data: { grai: "", },
    errors: {}
  };

  scheema = {
    _id: Joi.string(),
    grai:  Joi.string()
      .required()


      .label("grai"),
    createdAt: Joi.date()
      .label("createAt")
  };

  async populateForm() {
    try {
      const individualreturnableassetidentificationId = this.props.match.params.id;
      if(individualreturnableassetidentificationId!=="new"){
        const { data } = await getIndividualreturnableassetidentification(individualreturnableassetidentificationId);
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
    await saveIndividualreturnableassetidentification(this.state.data);
    this.props.history.push("/individualreturnableassetidentifications");
  };

  render() {
    return (
      <div className="content">
        <h1>Individualreturnableassetidentification Form</h1>
        <form onSubmit={this.handleSubmit}>

          <div className="form-group">
              <label htmlFor="grai">Grai</label>
              <input
                value={this.state.data["grai"]}
                onChange={this.handleChange}
                name="grai"
                id="grai"
                type="text"
                className="form-control"
              />
              {this.state.errors["grai"] && <div className="alert alert-danger">{this.state.errors["grai"]}</div>}
          </div>

          <button disabled={this.validate()} className="btn btn-primary custom-btn">Save</button>

        </form>
      </div>
    );
  }
}

export default createIndividualreturnableassetidentification;