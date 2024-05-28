import React, { useEffect, useState } from "react";
import Layout from "../components/layout";
import { graphql } from "gatsby";
import NewBuildView from "../components/views/new_builder/build";
import PageLayout from "../components/PageLayout";

// markup
const IndexPage = ({ data }: any) => {
  const [ create, setCreate ] = useState<"workflow" | "agent" | "skill" | "model" | null>(null);
  const buildNav = (category: "workflow" | "agent" | "skill" | "model") => {
      setCreate(category);
  }


  return (
    <PageLayout buildNav={buildNav}>
      <NewBuildView createNav={create} />
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
