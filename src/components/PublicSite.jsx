
import { useEffect } from "react";

const SUPPORT_EMAIL = "packets@beemissioncontrol.com";

function PublicShell({ children }) {
  return (
    <main className="public-site">
      <header className="public-site-header">
        <a className="public-site-brand" href="/home">
          Bee Mission Control
        </a>

        <nav aria-label="Public navigation">
          <a href="/home">Home</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a className="public-site-app-link" href="/">
            Private Application
          </a>
        </nav>
      </header>

      {children}

      <footer className="public-site-footer">
        <span>Bee Mission Control</span>
        <span>Personal productivity and organization software</span>
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </footer>
    </main>
  );
}

function PublicHome() {
  useEffect(() => {
    document.title = "Bee Mission Control";
    // TODO: Add Google site verification meta tag
  }, []);

  return (
    <PublicShell>
      <section className="public-hero">
        <p className="public-eyebrow">Domain pending</p>
        <h1>Bee Mission Control</h1>
        <p className="public-lede">
          This domain is reserved for the Bee Mission Control private application.
        </p>
      </section>
    </PublicShell>
  );
}

function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy | Bee Mission Control";
  }, []);

  return (
    <PublicShell>
      <article className="public-document">
        <p className="public-eyebrow">Privacy</p>
        <h1>Bee Mission Control Privacy Policy</h1>
        <p className="public-updated">Last updated: September 15, 2026</p>

        <h2>1. About Bee Mission Control</h2>
        <p>
          Bee Mission Control is a personal productivity and organization
          application. It helps the authorized user review schedules, organize
          tasks, retrieve relevant work information, manage files, and
          coordinate personal workflows.
        </p>

        <h2>2. Google account access</h2>
        <p>
          Bee Mission Control accesses Google account data only after the user
          explicitly authorizes access through Google OAuth.
        </p>
        <p>
          The application requests Google permissions only for features that
          the user chooses to use.
        </p>

        <h2>3. Google Calendar data</h2>
        <p>
          Bee Mission Control may access Google Calendar information including
          event titles, dates, start and end times, and other event information
          available through the Google Calendar permissions authorized by the
          user.
        </p>
        <p>
          Calendar data is used to display schedules, identify upcoming
          commitments, prepare daily planning information, detect scheduling
          conflicts, and help the user organize time-based tasks.
        </p>

        <h2>4. Gmail data</h2>
        <p>
          Bee Mission Control may access Gmail information when the user
          requests email-related functionality, such as locating relevant work
          messages, identifying scheduling information, or retrieving
          information needed for a user-requested workflow.
        </p>
        <p>
          Depending on the Google permissions authorized by the user, this may
          include message metadata such as sender, recipient, subject, date,
          labels, and message content needed to complete the requested task.
        </p>

        <h2>5. How Google user data is used</h2>
        <p>
          Google user data is used only to provide user-facing features
          requested by the authorized user. Examples include preparing
          schedules, identifying relevant work information, locating requested
          messages, and coordinating tasks based on authorized Google services.
        </p>
        <p>
          Bee Mission Control does not use Google user data for advertising,
          ad targeting, marketing profiles, or unrelated purposes.
        </p>

        <h2>6. Data storage and retention</h2>
        <p>
          Bee Mission Control is designed to avoid creating unnecessary copies
          of Google user data. Where practical, source information remains in
          the originating Google service and is retrieved when needed for a
          requested feature.
        </p>
        <p>
          Some derived information or application context may be stored within
          the user's Bee Mission Control environment when necessary to provide
          application functionality. Stored information is retained only as
g as needed for those functions or until it is removed.
        </p>

        <h2>7. Data sharing</h2>
        <p>
          Bee Mission Control does not sell Google user data.
        </p>
        <p>
          Bee Mission Control does not share Google user data with advertisers,
          data brokers, or other third parties for advertising, profiling, or
          marketing purposes.
        </p>
        <p>
          Google user data may be processed only by services necessary to
          provide user-requested functionality or when required for security,
          legal compliance, or protection against abuse.
        </p>

        <h2>8. Human access</h2>
        <p>
          Google user data is not routinely reviewed by humans.
        </p>
        <p>
          Human access may occur only when specifically authorized by the user,
          when necessary to investigate a security or technical issue, or when
          required by law.
        </p>

        <h2>9. Security</h2>
        <p>
          Bee Mission Control uses reasonable technical safeguards intended to
          protect account information and Google user data from unauthorized
          access, disclosure, alteration, or loss.
        </p>
        <p>
          Google OAuth credentials and authorization tokens are used only for
          authorized application functionality and are not intentionally
          exposed to unauthorized parties.
        </p>

        <h2>10. Revoking Google access</h2>
        <p>
          Users can revoke Bee Mission Control's access to their Google Account
          at any time through their Google Account security and permissions
          settings.
        </p>
        <p>
          Revoking access prevents Bee Mission Control from making future
          requests to Google services using that authorization.
        </p>

        <h2>11. Data deletion</h2>
        <p>
          Users may request deletion of information stored by Bee Mission
          Control by contacting the address below. Revoking Google access does
          not automatically delete information that may already have been
          stored within the user's Bee Mission Control environment.
        </p>

        <h2>12. Google API Services User Data Policy</h2>
        <p>
          Bee Mission Control's use and transfer of information received from
          Google APIs adheres to the Google API Services User Data Policy,
          including the Limited Use requirements.
        </p>
        <p>
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noreferrer"
          >
            View the Google API Services User Data Policy
          </a>
        </p>

        <h2>13. Changes to this policy</h2>
        <p>
          This Privacy Policy may be updated when Bee Mission Control's data
          practices or connected-service features change. The current version
          will remain available on this page with an updated revision date.
        </p>

        <h2>14. Contact</h2>
        <p>
          Privacy questions or deletion requests can be sent to{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </article>
    </PublicShell>
  );
}

function TermsOfService() {
  useEffect(() => {
    document.title = "Terms of Service | Bee Mission Control";
  }, []);

  return (
    <PublicShell>
      <article className="public-document">
        <p className="public-eyebrow">Terms</p>
        <h1>Bee Mission Control Terms of Service</h1>
        <p className="public-updated">Last updated: September 15, 2026</p>

        <h2>Service</h2>
        <p>
          Bee Mission Control is personal productivity and organization
          software provided for the authorized user's use.
        </p>

        <h2>Connected services</h2>
        <p>
          Some features depend on third-party services, including Google
          services. Access to those services requires authorization from the
          relevant account holder.
        </p>

        <h2>User responsibility</h2>
        <p>
          The user is responsible for reviewing application output before
          relying on it for important scheduling, documentation, or other
          decisions.
        </p>

        <h2>Availability</h2>
        <p>
          Features may change or become temporarily unavailable because of
          maintenance, local system conditions, or third-party service
          availability.
        </p>

        <h2>Contact</h2>
        <p>
          Questions can be sent to{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </article>
    </PublicShell>
  );
}

export { PublicHome, PrivacyPolicy, TermsOfService };
