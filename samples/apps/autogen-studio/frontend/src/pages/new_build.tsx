import React, { useEffect, useState } from "react";
import Layout from "../components/layout";
import { graphql } from "gatsby";
import NewBuildView from "../components/views/new_builder/build";
import PageLayout from "../components/PageLayout";

// markup
const IndexPage = ({ data }: any) => {
  const [ navExpand, setNavExpand] = useState(true);
  const [ create, setCreate ] = useState<"workflow" | "agent" | "skill" | "model" | null>(null);
  const [ buildNavOpen, setBuildNavOpen ] = useState(false);
  const buildNav = (category: "workflow" | "agent" | "skill" | "model") => {
      console.log(category);
      setCreate(category);
  }


  return (
    <PageLayout navExpand={navExpand} setNavExpand={setNavExpand} buildNav={buildNav} buildNavOpen={buildNavOpen} setBuildNavOpen={setBuildNavOpen}>
      <NewBuildView createNav={create} setNavExpand={setNavExpand} />
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
