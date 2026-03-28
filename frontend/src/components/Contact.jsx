import React from "react";
import GitHubProfile from "./GitHubProfile";

const ContactSection = () => {
  const githubUsernames = [
    "devTejaSrinivas",
    "sudhanshu1826",
    "sohamchitimali",
  ]; // Replace with actual GitHub usernames

  return (
    <div className="py-16 px-4">
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 text-white leading-tight">
        Our Team
      </h2>
      <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
        {githubUsernames.map((username) => (
          <GitHubProfile key={username} username={username} />
        ))}
      </div>
    </div>
  );
};

export default ContactSection;
