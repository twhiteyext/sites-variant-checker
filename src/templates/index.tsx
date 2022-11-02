 import {
    GetHeadConfig,
    GetPath,
    GetRedirects,
    HeadConfig,
    Template,
    TemplateConfig,
    TemplateProps,
    TemplateRenderProps,
  } from "@yext/pages";
  import * as React from "react";
  import PageLayout from "../components/page-layout";
  import "../index.css";
  
  /**
   * Required when Knowledge Graph data is used for a template.
   */
  export const config: TemplateConfig = {
    stream: {
      $id: "index-stream",
      // Specifies the exact data that each generated document will contain. This data is passed in
      // directly as props to the default exported function.
      fields: [
        "id",
        "uid",
        "meta",
        "name",
        "c_lastRunTimestamp",
        "c_children",
      ],
      // Defines the scope of entities that qualify for this stream.
      filter: {
        entityTypes: ["ce_index"],
      },
      // The entity language profiles that documents will be generated for.
      localization: {
        locales: ["en"],
        primary: false,
      },
    },
  };
  
  /**
   * Defines the path that the generated file will live at for production.
   *
   * NOTE: This currently has no impact on the local dev path. Local dev urls currently
   * take on the form: featureName/entityId
   */
  export const getPath: GetPath<TemplateProps> = ({ document }) => {
    return 'index';
  };
  
  /**
   * Defines a list of paths which will redirect to the path created by getPath.
   *
   * NOTE: This currently has no impact on the local dev path. Redirects will be setup on
   * a new deploy.
   */
  export const getRedirects: GetRedirects<TemplateProps> = ({ document }) => {
    return [`index-old/${document.id.toString()}`];
  };
  
  /**
   * This allows the user to define a function which will take in their template
   * data and procude a HeadConfig object. When the site is generated, the HeadConfig
   * will be used to generate the inner contents of the HTML document's <head> tag.
   * This can include the title, meta tags, script tags, etc.
   */
  export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = ({
    relativePrefixToRoot,
    path,
    document,
  }): HeadConfig => {
    return {
      title: document.name,
      charset: "UTF-8",
      viewport: "width=device-width, initial-scale=1",
      tags: [],
    };
  };

  function convertUnixTime(unix: string) {
    let a = new Date(parseInt(unix) * 1000),
        year = a.getFullYear(),
        months = ['January','February','March','April','May','June','July','August','September','October','November','December'],
        month = months[a.getMonth()],
        date = a.getDate(),
        hour = a.getHours(),
        min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes(),
        sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds();
    return `${month} ${date}, ${year}, ${hour}:${min}:${sec}`;
  }  

  let sortChildrenByTimestamp = (childComponents: any[]) => {
    return childComponents.sort(function (a: any, b: any) {
    a = a.timestamp.toLowerCase();
    b = b.timestamp.toLowerCase();
    return a < b ? 1 : a> b ? -1: 0;
    })
  }

  let sortChildrenBySiteId = (childComponents: any[]) => {
    return childComponents.sort(function (a: any, b: any) {
    a = a.siteId.toLowerCase();
    b = b.siteId.toLowerCase();
    return a < b ? 1 : a> b ? -1: 0;
    }) 
  }

  let sortChildrenByAccountId = (childComponents: any[]) => {
    return childComponents.sort(function (a: any, b: any) {
    a = a.accountId.toLowerCase();
    b = b.accountId.toLowerCase();
    return a < b ? 1 : a> b ? -1: 0;
    })
  }

  /**
   * This is the main template. It can have any name as long as it's the default export.
   * The props passed in here are the direct stream document defined by `config`.
   *
   * There are a bunch of custom components being used from the src/components folder. These are
   * an example of how you could create your own. You can set up your folder structure for custom
   * components any way you'd like as long as it lives in the src folder (though you should not put
   * them in the src/templates folder as this is specific for true template files).
   */
  const Index: Template<TemplateRenderProps> = ({
    relativePrefixToRoot,
    path,
    document,
  }) => {
    const {
      _site,
      name,
      c_lastRunTimestamp,
      c_children
    } = document;

    let childComponents = [];
    let splitChildren = c_children.split(',')
    for (var i = 0; i < splitChildren.length; i++) {
      var child = splitChildren[i]
      var parts = child.split(":")
      childComponents.push({
        timestamp: convertUnixTime(parts[0]),
        deployId: parts[1],
        siteId: parts[2],
        accountId: parts[3],
        isSame: parts[4],
      })
    }

    var lastRun = convertUnixTime(c_lastRunTimestamp)
    const [renderChildren, setRenderChildren] = React.useState(sortChildrenByTimestamp(childComponents));
  
    return (
      <>
        <PageLayout _site={_site}>
            <div className="centered-container">
              <div className="margin-bottom">
                <div className="column">
                  Last Run: {lastRun}
                </div>
                <div className="column">
                  <div className="right">
                    <h1 className="inline">
                      Sort by:
                    </h1>
                    <div className="inline" >

                      <button className="radioButton" name="siteId" onClick={()=>{setRenderChildren(sortChildrenBySiteId(JSON.parse(JSON.stringify(childComponents))))}}>SiteId</button>
                    </div>
                    <div className="inline" >
                      <button className="radioButton" name="accountId" onClick={()=>{setRenderChildren(sortChildrenByAccountId(JSON.parse(JSON.stringify(childComponents))))}}>AccountId</button>
                    </div>
                    <div className="inline" >
                      <button className="radioButton" onClick={()=>{setRenderChildren(sortChildrenByTimestamp(JSON.parse(JSON.stringify(childComponents))))}}>Most Recent</button>
                    </div>
                  </div>
                </div>
              </div>
              <br/>
              <div style={{marginTop: '40px'}}>
                <div className="child-inside"> DeployId </div>
                <div className="child-inside"> SiteId </div>
                <div className="child-inside"> AccountId </div>
                <div className="child-inside"> Timestamp </div>
              </div>
              <div>
                {renderChildren.map((child, i) =>
                  <div className={"child-isSame-"+child.isSame} key={"child"+i}>
                    <a className="child-inside" style={{fontWeight: '700'}} href={"/"+child.deployId}> {child.deployId} </a>
                    <div className="child-inside"> {child.siteId} </div>
                    <div className="child-inside"> {child.accountId} </div>
                    <div className="child-inside"> {child.timestamp} </div>
                  </div>
                )}
              </div>

            </div>
        </PageLayout>
      </>
    );
  };
  
  export default Index;