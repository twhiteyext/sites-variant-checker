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
        // "c_diffContents1",
        // "c_diffContents2",
        "c_isEqual"
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

 interface Activities {
    /** The entire document returned after applying the stream to a single entity */
    diffDeleteActivities: string[];
    diffUpdateActivities: string[];
    diffPublishActivities: string[];
}
  
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
      c_isEqual
    } = document;

    let formatCogDiff = (instance: String, publishStatus: String, streams: any[]) => (
        <div>
            <h1 className="bigHeader">
              Cog Results
            </h1>
            <div className="boldFont">
                {instance}
            </div>

            <div className="bottom-margin">
                PublishStatus: {publishStatus}
            </div>
            <div className="bottom-margin">
              {streams != null && streams.length > 0 ? (
                <div className="pathDiff">
                  <h1 className="boldFont">Streams</h1>
                  {streams.map(stream => 
                    <div className="bottom-margin">
                      <div>
                        Name: {stream.name}
                      </div>
                      <div>
                        Stored Doc Count: {stream.storedDocCount}
                      </div>
                      <div>
                        Initial Task Doc Count: {stream.initialTaskDocCount}
                      </div>
                      <div>
                        Initial Task Duration: {stream.initialTaskDuration}
                      </div>
                      <div>
                        Is Archived: {stream.isArchived.toString()}
                      </div>
                    </div>
                )}
                </div>
              ): (null)}
            </div>
        </div>
    )

    let formatCwebDiff = (pathsOnly: String[], diffContentPaths: String[]) => (
      <div>
          <h1 className="bigHeader">
            CWeb Results
          </h1>
          {!c_doesContentMatch ? (
            <h1 className="instanceDoesNotMatch">
              Content Doesn't Match
            </h1>
          ):(null)}
          {pathsOnly != null && pathsOnly.length > 0 ? (
              <div className="bottom-margin">
              The following paths exist in this instance but not the other:
                  <div className="pathDiff">
                      {pathsOnly.map(path => <div>{path}</div>)}
                  </div>
              </div>
          ): null}
          {/* {diffContentPaths != null && diffContentPaths.length > 0 ? (
              <div>
              The following paths resulted in this differing content:
                  {{diffContents.map((content, i) => 
                      <div>
                          <div>
                              Path: {diffContentPaths[i]}
                          </div>
                          <div >
                              Content: 
                          </div>
                          <div className="pathDiff">
                          </div>
                       </div>
                  )}
              </div>
          ): null} */}
      </div>
  )

  let formatActivityDiff = (activities: Activities) => (
    <div>
        <h1 className="bigHeader">
          CogActivityLog Results
        </h1>
        { activities != null ?(
          <div>
            {activities.diffDeleteActivities != null ? (
              <div>
                <div className="boldFont">
                  Diff Delete Activities
                </div>
                <div className="pathDiff">
                  <div>
                    {activities.diffDeleteActivities.map(id => <div>{id}</div>)}
                  </div>
                </div>
              </div>
            ):null}

            {activities.diffUpdateActivities != null ? (
              <div>
                <div className="boldFont">
                  Diff Update Activities
                </div>
                <div className="pathDiff">
                  <div>
                    {activities.diffUpdateActivities.map(id => <div>{id}</div>)}
                  </div>
                </div>
              </div>
            ):null}

            
            {activities.diffPublishActivities != null ? (
              <div>
                <div className="boldFont">
                  Diff Publish Activities
                </div>
                <div className="pathDiff">
                  <div>
                    {activities.diffPublishActivities.map(id => <div>{id}</div>)}
                  </div>
                </div>
              </div>
            ):null}
          </div>
        ):(null)}
    </div>
)

    let sortedStreams1 = c_instance1Streams.sort(function (a: any, b: any) {
      a = a.name.toLowerCase();
      b = b.name.toLowerCase();
      return a < b ? -1 : a> b ? 1: 0;
    })
    let sortedStreams2 = c_instance2Streams.sort(function (a: any, b: any) {
      a = a.name.toLowerCase();
      b = b.name.toLowerCase();
      return a < b ? -1 : a> b ? 1: 0;
    })
  
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
                            Deploy Time: {convertUnixTime(c_createdTimestamp)}
                        </div>
                    </div>

                    <div>
                      <div className="column">
                          {formatCogDiff(c_instance1, c_publishStatus1, sortedStreams1)}
                      </div>
                      <div className="columnDivider"/>
                      <div className="column">
                          {formatCogDiff(c_instance2, c_publishStatus2, sortedStreams2)}
                      </div>
                    </div>

                    <div>
                      <div className="column">
                          {formatCwebDiff(c_pathsOnlyIn1.sort(), c_diffContentPaths.sort())}
                      </div>
                      <div className="columnDivider"/>
                      <div className="column">
                          {formatCwebDiff(c_pathsOnlyIn2.sort(), c_diffContentPaths.sort())}
                      </div>
                    </div>

                    <div>
                      <div className="column">
                          {formatActivityDiff(c_instance1Activities)}
                      </div>
                      <div className="columnDivider"/>
                      <div className="column">
                          {formatActivityDiff(c_instance2Activities)}
                      </div>
                    </div>

                </div>
            </div>
        </PageLayout>
      </>
    );
  };
  
  export default InstanceDiff;
  