import * as React from "react";
import { graphql } from "gatsby";
import RAView from "../components/views/playground/ra";
import PageLayout from "../components/PageLayout";

// markup
const IndexPage = ({ data }: any) => {
  return (
    <PageLayout location="home" meta={data.site.siteMetadata} title="Home" buildNav={() => {}} defaultCollapse={true}>
      <main style={{ height: "100%" }} className=" h-full ">
        <RAView />
      </main>
    </PageLayout>
  );
};

export const query = graphql`
  query HomePageQuery {
    site {
      siteMetadata {
        description
        title
      }
    }
  }
`;

export default IndexPage;
