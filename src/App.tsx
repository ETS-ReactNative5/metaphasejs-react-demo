//todo: en la linea que dice que los datos han sido cargados desde codigo poner enlace a dialogo codigo
//todo: arreglar spinner en dialogo user para que no aparezca teclado virtual
//todo: opcion para salvar db a localstorage
//todo: separador de mensajes de logger
//todo: smoke tests
//todo: probar en iexplorer. (avisar de navegador no soportado)
//todo: probar a pasar el estado como props de tipo array. Ejm: store = {users: users.getAll(), posts: posts.getAll()}
//todo: considerar el uso de polyfills como core-js

import * as React from 'react';
import {saveDbToFile, getUrlParameter, updateQueryStringParameter, Model} from "metaphasejs";
import {users, posts, comments} from "./store";
import {User} from "./models/user";
import {Post} from "./models/post";
import {Comment} from "./models/comment";
import ReactJson from 'react-json-view';
import './App.css';

import {Sidebar} from "primereact/components/sidebar/Sidebar";
import {Toolbar} from 'primereact/components/toolbar/Toolbar';
import {Button} from "primereact/components/button/Button";
import {DataTable} from 'primereact/components/datatable/DataTable';
import {Column} from 'primereact/components/column/Column';
import {ScrollPanel} from 'primereact/components/scrollpanel/ScrollPanel';
import {Panel} from 'primereact/components/panel/Panel';
import {DialogBase} from "./DialogCmp/DialogBase";
import {DialogUser} from "./DialogCmp/DialogUser";
import {DialogPost} from "./DialogCmp/DialogPost";
import {DialogComment} from "./DialogCmp/DialogComment";
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/omega/theme.css';
import 'font-awesome/css/font-awesome.css';
import * as utils from "./utils";


declare const SQL: any;

export class App extends React.Component {

  SHOW_CHILDREN = true;

  DB_FILENAME = 'metaphase.sqlite';

  state: {
    children: boolean,
    selectedModel: Model | undefined,
    displayLeftMenu: boolean,
    displayDialogCode: boolean,
    logger: boolean,
    loadDbFromFile: boolean,
  };

  constructor(props: any) {
    super(props);
    this.state = {
      children: this.SHOW_CHILDREN,
      selectedModel: undefined,
      displayLeftMenu: false,
      displayDialogCode: false,
      logger: utils.isLoggerEnabled(),
      loadDbFromFile: utils.isLoadDbFromFile(),
    };
    this.updateState = this.updateState.bind(this);
  }

  reactJsonViewCmp: React.Component;

  dialogUser: DialogUser;

  dialogPost: DialogPost;

  dialogComment: DialogComment;

  iframecode: HTMLIFrameElement;

  componentWillMount() {
    if (getUrlParameter('logger').toLowerCase() === 'true') {
      this.setState({logger: true});
    } else {
      this.setState({logger: false});
    }
  }

  componentDidMount() {
    utils.removeElementFromDom('loader');
  }

  updateState() {
    this.forceUpdate();
  }

  showChildren() {
    const {children} = this.state;
    this.setState({
      children: !children,
      jsonContent: users.getAll({children: !children}),
      displayDialogCode: false
    });
  }

  saveDbToDisk() {
    saveDbToFile(this.DB_FILENAME);
    this.setState({displayLeftMenu: false});
  }

  add(model: Model, dialogAdd: DialogBase) {
    this.setState({selectedModel: model});
    dialogAdd.show();
  }

  btnEdit(selectedModel: Model) {
    const edit = () => {
      selectedModel.tableName() === 'users' && this.dialogUser.show();
      selectedModel.tableName() === 'posts' && this.dialogPost.show();
      selectedModel.tableName() === 'comments' && this.dialogComment.show();
      this.setState({selectedModel: selectedModel});
    };
    return (
      <Button onClick={_ => edit()} className="ui-button-info" icon="fa-edit" title="Edit"/>
    )
  }

  btnRemove(model: Model) {
    const remove = (model: Model) => {
      if (model.isSaved()) {
        model.remove();
        this.updateState();
      }
    };
    return (
      <Button onClick={_ => remove(model)} className="ui-button-danger" icon="fa-trash" title="Delete"/>
    )
  }

  btnBurguer() {
    this.setState({displayLeftMenu: !this.state.displayLeftMenu});
  }

  showCode() {
    const iframe = this.iframecode;
    const iframeLoader = '<div style="text-align: center; font-family: Arial; font-size: 12px;">Loading...</div>';
    const iframeBody = iframe.contentDocument && iframe.contentDocument.body as HTMLBodyElement;
    iframeBody && (iframeBody.innerHTML = iframeLoader);
    setTimeout(_ =>
      iframe.src = "highlighted.code.html"
    , 500);
    document.body.style.overflow = 'hidden';
    this.setState({displayLeftMenu: false, displayDialogCode: true});
  }

  hideCode() {
    document.body.style.overflow = 'visible';
    this.setState({displayLeftMenu: false, displayDialogCode: false});
  }

  switchLogger() {
    const {logger} = this.state;
    this.setState({logger: !logger});
    if (logger) {
      alert('Logger System Off.\n\nReloading...');
    } else {
      alert('Logger System On. Check browser console.\n\nReloading...');
    }
  }

  getUrlAppWithLogger(): string {
    if (this.state.logger) {
      return updateQueryStringParameter(location.href, 'logger', 'true');
    } else {
      return updateQueryStringParameter(location.href, 'logger', 'false');
    }
  }

  getUrlAppLoadDbFromDisk(): string {
    if (this.state.loadDbFromFile) {
      return updateQueryStringParameter(location.href, 'dbfile', this.DB_FILENAME);
    } else {
      return updateQueryStringParameter(location.href, 'dbfile', '');
    }
  }

  switchDb() {
    const {loadDbFromFile} = this.state;
    this.setState({loadDbFromFile: !loadDbFromFile});
    if (loadDbFromFile) {
      alert('Loading application state from database created by code...')
    } else {
      alert('Loading application state from database file...');
    }
   }

  render() {

    const {children, selectedModel, displayLeftMenu, displayDialogCode} = this.state;
    const defaultUser = new User({name: '', age: '', admin: 0});
    const defaultPost = new Post({title: '', content: '', user_id: 0});
    const defaultComment = new Comment({author: '', date: new Date(), post_id: 0});

    const mapIsAdminValue = (model: Model): string => {
      return model.admin ? 'True' : 'False';
    };
    const footerTableUsers = (
      <div className="ui-helper-clearfix full-width">
        <Button className="float-left" icon="fa-plus" label="Add New"
                onClick={_ => this.add(defaultUser, this.dialogUser)}/>
      </div>
    );
    const footerTablePosts = (
      <div className="ui-helper-clearfix full-width">
        <Button className="float-left" icon="fa-plus" label="Add New"
                onClick={_ => this.add(defaultPost, this.dialogPost)}/>
      </div>
    );
    const footerTableComments = (
      <div className="ui-helper-clearfix full-width">
        <Button className="float-left" icon="fa-plus" label="Add New"
                onClick={_ => this.add(defaultComment, this.dialogComment)}/>
      </div>
    );
    const dialogProps = {
      selectedModel: selectedModel,
      updateState: this.updateState,
      children: children
    };
    const JsonViewPanelHeader = (
      <span>✅ Json State View<input type="checkbox" checked={children}
                               onChange={_ => this.showChildren()} className="checkbox-children"/>
      <span className="checkbox-children-label" onClick={_ => this.showChildren()}>Show Children</span></span>
    );
    const loadStateFromFileMsg = (
      <div className="subtitle">
        Application state loaded from file:&nbsp;
        <a href="javascript:void(0)" target="_blank" onClick={_ => this.saveDbToDisk()}>
          {this.DB_FILENAME}
        </a>
        <div>You can download db file and query it uploading it to "Menu &raquo; Online SQLite Viewer"</div>
      </div>
    );
    const loadStateFromCodeMsg = (
      <div className="subtitle">Application state loaded from code</div>
    );


    return (

      <div className="main-content">

        {/*top menu bar*/}
        <Toolbar>
          <div className="ui-toolbar-group-left">
            <Button icon="fa-bars" onClick={_ => this.btnBurguer()} className="btn-menu"/>
          </div>
          <strong className="title">MetaphaseJS Demo</strong>
        </Toolbar>

        {/*left side menu*/}
        <Sidebar visible={displayLeftMenu} baseZIndex={1000000}
                 onHide={() => this.setState({displayLeftMenu: false})}>
          <h3>
            <a href="https://yagolopez.github.io/metaphasejs" target="_blank" className="logo-leftside-menu"
              title="GitHub Project"><img src="mp-logo-leftmenu.svg" className="logo-leftside-menu"/></a>
              &nbsp;MetaphaseJS
          </h3>
          <a href="javascript:void(0)" className="left-menu-item" onClick={_ => this.showCode()}>
            <i className="fa fa-file-code-o"></i><span>Show Code</span>
          </a>
          <a href={this.getUrlAppWithLogger()} className="left-menu-item" onClick={_ => this.switchLogger()}>
            <i className="fa fa-refresh"></i><span>Switch Logger</span>
          </a>
          <a href={this.getUrlAppLoadDbFromDisk()} className="left-menu-item" onClick={_ => this.switchDb()}>
            <i className="fa fa-refresh"></i><span>Switch data origin</span>
          </a>
          <a href="javascript:void(0)" className="left-menu-item" target="_blank" onClick={_ => this.saveDbToDisk()}>
            <i className="fa fa-download"></i><span>Save state to file</span>
          </a>
          <a href="https://sqliteonline.com" className="left-menu-item" target="_blank">
            <i className="fa fa-external-link"></i><span>Online SQLite Viewer</span>
          </a>
          <br/>
        </Sidebar>

        {/*show code dialog*/}
        <Sidebar fullScreen={true} visible={displayDialogCode} onHide={() => this.hideCode()}>
          <h2 className="centered title-border">✅ Code View</h2>
          <div className="centered subtitle">Source code for model definitions, relations and collections</div>
          <div className="flex-x">
            <iframe ref={(el: HTMLIFrameElement) => this.iframecode = el} src="#" className="iframe-code2"></iframe>
          </div>
        </Sidebar>

        <div className="fade-in-long">

          <section className="subtitle subtitle-paragraph">
            <div>
              This React app uses a Sqlite database to manage state
            </div>
            <div>
              Data used is relational. For example, if you delete a user, all posts related
              to that user are deleted in cascade automatically.
            </div>
            <div>
              Relational data management in Redux is much more complicated
            </div>
          </section>

          <div>{this.state.loadDbFromFile ? loadStateFromFileMsg : loadStateFromCodeMsg}</div>

          {/*json state view*/}
          <Panel header={JsonViewPanelHeader} toggleable={true}>
            <ScrollPanel className="custom json-view-container">
              <ReactJson ref={(el: React.Component) => this.reactJsonViewCmp = el}
                src={users.getAll({children})} iconStyle={'square'} name="USERS"
                enableClipboard={false} displayDataTypes={false}
                displayObjectSize={false} theme={'shapeshifter:inverted'}/>
            </ScrollPanel>
          </Panel>

          {/*table state view*/}
          <Panel header="✅ Table State View" toggleable={true}>

            <DataTable value={users.getAll()}
                       header="USERS" footer={footerTableUsers} className="centered">
              <Column field="id" header="Id"/>
              <Column field="name" header="Name" className="ellipsis"/>
              <Column field="age" header="Age"/>
              <Column field="admin" header="Admin" body={(model: Model) => mapIsAdminValue(model)}/>
              <Column header="Edit" body={(model: Model) => this.btnEdit(model)}/>
              <Column header="Delete" body={(model: Model) => this.btnRemove(model)}/>
            </DataTable>

            <DataTable value={posts.getAll()}
                       header="POSTS" footer={footerTablePosts} className="centered">
              <Column field="id" header="Id"/>
              <Column field="title" header="Title"/>
              <Column field="content" header="Content" className="ellipsis"/>
              <Column field="user_id" header="User Id"/>
              <Column header="Edit" body={(model: Model) => this.btnEdit(model)}/>
              <Column header="Delete" body={(model: Model) => this.btnRemove(model)}/>
            </DataTable>

            <DataTable value={comments.getAll()}
                       header="COMMENTS" footer={footerTableComments} className="centered">
              <Column field="id" header="Id"/>
              <Column field="author" header="Author" className="ellipsis"/>
              <Column field="date" header="Date" className="ellipsis"/>
              <Column field="post_id" header="Post Id"/>
              <Column header="Edit" body={(model: Model) => this.btnEdit(model)}/>
              <Column header="Delete" body={(model: Model) => this.btnRemove(model)}/>
            </DataTable>

          </Panel>

          {/*Schema View*/}
          <Panel header="✅ Schema State View (static)" toggleable={true}>
            <ScrollPanel className="uml-img-container">
              <img className="uml-img" src={require("./uml/uml.jpg")}/>
            </ScrollPanel>
          </Panel>

        </div>

        <br/>

        <DialogUser ref={(el: DialogUser) => this.dialogUser = el} {...dialogProps}/>

        <DialogPost ref={(el: DialogPost) => this.dialogPost = el} {...dialogProps}/>

        <DialogComment ref={(el: DialogComment) => this.dialogComment = el} {...dialogProps}/>

      </div>
    )
  }
}
