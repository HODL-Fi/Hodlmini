"use client";

import React from "react";
import BorrowTopNav from "@/components/BorrowTopNav";

export default function TermsPage() {
  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <BorrowTopNav title="Terms & privacy" showBack />
        </div>
        <section className="mx-auto mt-4 max-w-[560px] pb-20">
          <article className="prose prose-sm max-w-none text-[16px] leading-7 text-gray-800">
            <p>
              The words of which the initial letter is capitalized have meanings defined under the following
              conditions. The following definitions shall have the same meaning regardless of whether they appear in
              singular or in plural.
            </p>
            <p>
              “Affiliate” means an entity that controls, is controlled by or is under common control with a party.
              “Account” means a unique account created for You to access our Service. “Company” ("We", "Us" or
              "Our") refers to the Service Operator. “Country” refers to the jurisdiction where the Company is
              established. “Content” refers to all text, images, or other information that can be posted, uploaded,
              linked to or otherwise made available by You, regardless of the form of that content.
            </p>
            <p>
              By accessing or using the Service You agree to be bound by these Terms. If You disagree with any part of
              the Terms then You may not access the Service.
            </p>
            <h3>Privacy</h3>
            <p>
              Your use of the Service is also conditioned on Your acceptance of Our Privacy Policy. Please review it to
              understand how We collect, use and disclose information about You.
            </p>
            <h3>Accounts</h3>
            <p>
              When You create an account, You must provide Us information that is accurate, complete, and current at
              all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination
              of Your account on Our Service.
            </p>
            <h3>Limitation of liability</h3>
            <p>
              To the maximum extent permitted by applicable law, in no event shall the Company be liable for any
              indirect, incidental, special, consequential or punitive damages, including without limitation, loss of
              profits, data, use, goodwill, or other intangible losses.
            </p>
            <h3>Changes</h3>
            <p>
              We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. What
              constitutes a material change will be determined at Our sole discretion.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}


