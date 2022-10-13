import * as React from "react";
import Cta from "../components/cta";

type Link = {
  label: string;
  url: string;
};

const links: Link[] = [
  {
    label: "Home",
    url: "/",
  },
  {
    label: "About",
    url: "/turtlehead-tacos",
  },
];

const Header = () => {
  const linkDoms = links.map((link) => (
    <div key={link.label}>
      <a href={link.url} target="_blank" rel="noreferrer">
        {link.label}
      </a>
    </div>
  ));

  return (
    <>
      <div className="centered-container">
        <nav className="py-6 flex items-center justify-between">
          <div className="text-2xl font-semibold">Instance Variant Checker</div>
          <img
            src="https://cdn.fs.brandfolder.com/cache=expiry:604800/deY3VGFpSjC761Abjbfc"
            width="40"
            height="40"
          ></img>
        </nav>
      </div>
    </>
  );
};

export default Header;
