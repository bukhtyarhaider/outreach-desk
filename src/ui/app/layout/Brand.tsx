/** Product identity is separate from the active account's editable business identity. */
export function Brand() {
  return (
    <a className="workspace-brand" href="#dashboard" aria-label="Outreach Desk overview">
      <img src="/brand/outreach-desk.png" alt="Outreach Desk" width="2172" height="724" />
      <span id="brandMark" hidden>
        OD
      </span>
      <span id="brandName" hidden>
        Outreach Desk
      </span>
    </a>
  );
}
