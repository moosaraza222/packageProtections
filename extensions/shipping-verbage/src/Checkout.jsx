import '@shopify/ui-extensions/preact';
import {render} from "preact";

export default async () => {
  render(<Extension />, document.body)
};

function Extension() {
  return (
    <s-banner heading="Shipping Information">
      <s-text>
        Orders placed by 3:00 PM Eastern Time, Monday through Friday, will ship
        the same business day. Orders received after 3:00 PM ET or during office
        closures will ship the next business day.
      </s-text>
    </s-banner>
  );
}
