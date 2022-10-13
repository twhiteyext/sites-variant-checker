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
        "c_doesContentMatch",
        "c_instance1PathDiffs",
        "c_instance2PathDiffs"
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
    return document.slug
      ? document.slug
      : `${document.id.toString()}`;
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
      c_instance1PathDiffs,
      c_instance2PathDiffs,
      c_doesContentMatch,
    } = document;

    let formatDiff = (instance: String, pathDiffs: String) => (
        <div>
            <div className="boldFont">
                {instance}
            </div>
            {pathDiffs.length > 0 ? (
                <div>
                The following paths exist in this instance but not the other:
                    <div className="pathDiff">
                        {pathDiffs}
                    </div>
                </div>
            ): null }
        </div>
    )
  
    return (
      <>
        <PageLayout _site={_site}>
            <div className="centered-container">
                {c_doesContentMatch ? (
                    <div className="instanceMatch">
                        Content Matches
                    </div>
                ):(
                    <div className="instanceDoesNotMatch">
                        Content Does Not Match
                    </div>
                )}

                <div className="row">
                    <div className="column">
                        {formatDiff(c_instance1, c_instance1PathDiffs)}
                    </div>
                    <div className="column">
                        {formatDiff(c_instance2, c_instance2PathDiffs)}
                    </div>
                </div>
            </div>
        </PageLayout>
      </>
    );
  };
  
  export default InstanceDiff;
  