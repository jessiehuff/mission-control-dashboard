import Head from "next/head";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { Data } from "@/getters";
import { Layout, TestStatusTable, TestStatusItem } from "@/app";
import axios from "axios";
import {ReleaseStatusTable} from "@/app/ReleaseStatusTable";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [repoStatuses, setRepoStatuses] = useState<Data>({
    repos: [],
    statuses: {},
  });

  const refresh = () =>
    axios.get("/api/status").then((res) => setRepoStatuses(res.data));

  useEffect(() => {
    refresh();
  }, []);

  const syncRepos = () => {
    repoStatuses.repos.forEach((repo) => {
      const { syncStatus } = repoStatuses.statuses[repo];
      if (syncStatus !== "synced") {
        axios
          .post("/api/sync", null, { params: { repo, branch: "main" } })
          .then((res) => console.log(res));
      }
    });
    setTimeout(() => refresh(), 2000);
  };

  const renewBumps = () => {
    repoStatuses.repos.forEach((repo) => {
      axios
        .post("/api/close", null, { params: { repo } })
        .then((res) => console.log(res));
    });
    setTimeout(() => refresh(), 2000);
  };

  const statusItems: TestStatusItem[] = repoStatuses.repos.map((repoName) => {
    const { workflowStatus, syncStatus } = repoStatuses.statuses[repoName];

    return { name: repoName, status: workflowStatus, syncStatus };
  });

  return (
    <>
      <Head>
        <title>PatternFly status dashboard</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/Favicon-Light.png" />
      </Head>
      <Layout>
        <TestStatusTable
          statusItems={statusItems}
          refresh={refresh}
          submit={syncRepos}
          renewBumps={renewBumps}
        />
        <ReleaseStatusTable />
      </Layout>
    </>
  );
}
