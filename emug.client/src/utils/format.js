// datele vin de la server in UTC
export const formatDate = (iso) =>
    new Date(iso.endsWith("Z") ? iso : `${iso}Z`).toLocaleString("ro-RO", {
        dateStyle: "medium",
        timeStyle: "short",
    });
