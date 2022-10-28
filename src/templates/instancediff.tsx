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

  /**
   * Required when Knowledge Graph data is used for a template.
   */
  export const config: TemplateConfig = {
    stream: {
      $id: "instancediff-stream",
      // Specifies the exact data that each generated document will contain. This data is passed in
      // directly as props to the default exported function.
      fields: [
        "id",
        "uid",
        "meta",
        "name",
        "c_instance1",
        "c_instance2",
        "c_createdTimestamp",
        "c_instance1Activities",
        "c_instance2Activities",
        "c_publishStatus1",
        "c_publishStatus2",
        "c_instance1Streams",
        "c_instance2Streams",
        "c_doesContentMatch",
        "c_pathsOnlyIn1",
        "c_pathsOnlyIn2",
        "c_diffContentPaths",
        "c_diffContents1",
        "c_diffContents2",
        "c_isEqual",
      ],
      // Defines the scope of entities that qualify for this stream.
      filter: {
        entityTypes: ["ce_instanceDiff"],
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
    return `instancediff/${document.id.toString()}`;
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
  
  /**
   * This is the main template. It can have any name as long as it's the default export.
   * The props passed in here are the direct stream document defined by `config`.
   *
   * There are a bunch of custom components being used from the src/components folder. These are
   * an example of how you could create your own. You can set up your folder structure for custom
   * components any way you'd like as long as it lives in the src folder (though you should not put
   * them in the src/templates folder as this is specific for true template files).
   */
  const InstanceDiff: Template<TemplateRenderProps> = ({
    relativePrefixToRoot,
    path,
    document,
  }) => {
    const {
      _site,
      name,
      c_instance1,
      c_instance2,
      c_createdTimestamp,
      c_instance1Activities,
      c_instance2Activities,
      c_publishStatus1,
      c_publishStatus2,
      c_instance1Streams,
      c_instance2Streams,
      c_doesContentMatch,
      c_pathsOnlyIn1,
      c_pathsOnlyIn2,
      c_diffContentPaths,
      c_diffContents1,
      c_diffContents2,
      c_isEqual,
    } = document;

    let formatDiff = (instance: String, activities: any, publishStatus: String, streams: any[], pathsOnly: String[], diffContentPaths: String[], diffContents: String[]) => (
        <div>
            <div className="boldFont">
                {instance}
            </div>

            <div className="bottom-margin">
                PublishStatus: {publishStatus}
            </div>
            <div className="bottom-margin">
              {streams != null && streams.length > 0 ? (
                <div>
                {streams.map(stream => 
                    <div className="pathDiff">
                        Name: {stream.name}
                        Stored Doc Count: {stream.storedDocCount}
                        Initial Task Doc Count: {stream.initialTaskDocCount}
                        Initial Task Duration: {stream.initialTaskDuration}
                        Is Archived: {stream.isArchived}
                    </div>
                )}
                </div>
              ): (null)}
            </div>
            { activities != null ?(
              <div>
                <div>
                  Diff Delete Activities
                  {activities.diffDeleteActivities}
                </div>
                <div>
                  Diff Publish Activities
                  {activities.diffPublishActivities}
                </div>
                <div>
                  Diff Update Activities
                  {activities.diffUpdateActivities}
                </div>
              </div>
            ):(null)}
            {pathsOnly != null && pathsOnly.length > 0 ? (
                <div className="bottom-margin">
                The following paths exist in this instance but not the other:
                    <div className="pathDiff">
                        {pathsOnly.map(path => <div>{path}</div>)}
                    </div>
                </div>
            ): null}
            {diffContents != null && diffContents.length > 0 ? (
                <div>
                The following paths resulted in this differing content:
                    {diffContents.map((content, i) => 
                        <div>
                            <div>
                                Path: {diffContentPaths[i]}
                            </div>
                            <div >
                                Content: 
                            </div>
                            <div className="pathDiff">
                                {content}
                            </div>
                         </div>
                    )}
                </div>
            ): null}
        </div>
    )
  
    return (
      <>
        <PageLayout _site={_site}>
            <div className="centered-container">
                {c_isEqual ? (
                    <div className="instanceMatch">
                        Instances are equal
                    </div>
                ):(
                    <div className="instanceDoesNotMatch">
                        Instances are not equal
                    </div>
                )}

                <div className="row">
                    <div style={{marginBottom: "20px"}}>
                        <div className="inline-row">
                            Created Time: {convertUnixTime(c_createdTimestamp)}
                        </div>
                        <div className="inline-row">
                            Is Equal: {`${c_isEqual}`}
                        </div>
                        <div className="inline-row">
                            Does Content Match: {`${c_doesContentMatch}`}
                        </div>
                    </div>

                    <div className="column">
                        {formatDiff(c_instance1, c_instance1Activities, c_publishStatus1, c_instance1Streams, c_pathsOnlyIn1, c_diffContentPaths, c_diffContents1)}
                    </div>
                    <div className="column">
                        {formatDiff(c_instance2, c_instance2Activities, c_publishStatus2, c_instance2Streams, c_pathsOnlyIn2, c_diffContentPaths, c_diffContents2)}
                    </div>
                </div>
            </div>
        </PageLayout>
      </>
    );
  };
  
  export default InstanceDiff;
  