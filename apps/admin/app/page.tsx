import { redirect } from "next/navigation";

import { firstEnabledAdminPath } from "../lib/features";

export default function AdminHome() {
  // Land on the first module that is switched on — "/tyres" is not guaranteed
  // to exist once the products module can be disabled from the environment.
  redirect(firstEnabledAdminPath());
}
