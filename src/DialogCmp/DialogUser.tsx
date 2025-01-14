import * as React from 'react';
import {Dialog} from "primereact/components/dialog/Dialog";
import {DialogBase} from "./DialogBase";
import {InputText} from "primereact/components/inputtext/InputText";
import {Dropdown} from "primereact/components/dropdown/Dropdown";
import {Button} from "primereact/components/button/Button";
import * as NumericInput from "react-numeric-input";
import {setReadOnlyAttr} from "../utils";



export class DialogUser extends DialogBase {

  onIsAdminChange(value: any) {
    const selectedModel = {...this.state.selectedModel};
    selectedModel.admin = value;
    this.setState({selectedModel: selectedModel});
  }

  componentDidMount() {
    // Avoids to show virtual keyboard in smartphones
    setReadOnlyAttr('#admin > div > input');
    setReadOnlyAttr('#age');
  }

  render() {
    const {selectedModel, displayDialog} = this.state;
    const isAdminOptions = [{label: 'True', value: 1}, {label: 'False', value: 0}];
    const footerDialog = (
      <div className="ui-dialog-buttonpane ui-helper-clearfix">
        <Button icon="fa-close" label="Cancel" onClick={_ => this.onBtnCancel()}/>
        <Button label="Save" icon="fa-check" onClick={_ => this.onBtnSave()}/>
      </div>
    );

    return (
      <Dialog visible={displayDialog} header="User" modal={true} responsive={false}
              footer={footerDialog} onHide={() => this.setState({displayDialog: false})}>
          <div className="ui-grid ui-grid-responsive ui-fluid">
          <div className="ui-grid-row">
            <div className="ui-grid-col-4 dialog-label">
              <label htmlFor="name">Name</label>
            </div>
            <div className="ui-grid-col-8 dialog-label">
              <InputText id="name" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
                         onChange={(e: any) => {this.updateProperty('name', e.target.value)}}
                         value={selectedModel ? selectedModel.name : ''}/>
            </div>
          </div>
          <div className="ui-grid-row">
            <div className="ui-grid-col-4 dialog-label">
              <label htmlFor="age">Age <div className="dialog-small">(1 to 100)</div></label>
            </div>
            <div className="ui-grid-col-8 dialog-label">
              <NumericInput id="age" mobile={true} min={1} max={100} strict={true}
                            onChange={(age: number) => {this.updateProperty('age', age)}}
                            value={selectedModel && selectedModel.age}/>
            </div>
          </div>
          <div className="ui-grid-row">
            <div className="ui-grid-col-4 dialog-label">
              <label htmlFor="admin">Admin</label>
            </div>
            <div className="dialog-label">
              <Dropdown value={selectedModel ? selectedModel.admin : ''}
                        id="admin" options={isAdminOptions}
                        onChange={(e: {originalEvent: Event, value: any}) => this.onIsAdminChange(e.value)}
                        className="dropdown" placeholder="Is Admin?"/>
            </div>
          </div>
        </div>
      </Dialog>
    )
  }
}