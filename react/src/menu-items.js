const user_type = localStorage.getItem("user_type");

let menuItems = {
  items: [
    {
      id: "navigation",
      title: "Tender Management",
      type: "group",
      icon: "icon-navigation",
      children: [
        {
          id: "dashboard",
          title: "Dashboard",
          type: "item",
          icon: "material-icons-two-tone",
          iconname: "home",
          url: "dashboard",
        },
      ],
    },
    {
      id: "ui-element",
      type: "group",
      icon: "icon-ui",
      children: [
        {
          id: "view",
          title: "View",
          type: "item",
          icon: "material-icons-two-tone",
          iconname: "remove_red_eye",
          url: "View_all_tender",
        },
        {
          id: "add_tender",
          title: "Add Tender",
          type: "item",
          icon: "material-icons-two-tone",
          iconname: "playlist_add",
          url: "/Add_tender",
        },
        // {
        //   id: "enter_row_tender",
        //   title: "Enter Row Tender",
        //   type: "item",
        //   icon: "material-icons-two-tone",
        //   iconname: "add_comment",
        //   url: "/Enter_row_tender",
        // },
        {
          id: "add_tender_category",
          title: "Add Tender Category",
          type: "item",
          icon: "material-icons-two-tone",
          iconname: "file_copy",
          url: "/Add_tender_category",
        },
        // {
        //   id: "add_reminder",
        //   title: "Add Reminder",
        //   type: "item",
        //   icon: "material-icons-two-tone",
        //   iconname: "input",
        //   url: "/Add_reminder",
        // },
        {
          id: "archive_list",
          title: "Archive List",
          type: "item",
          icon: "material-icons-two-tone",
          iconname: "add_road",
          url: "/Archive_list",
        },
      ],
    },
  ],
};

if (user_type === "Accounts") {
  menuItems = {
    items: [
      {
        id: "navigation",
        title: "Accounts Panel",
        type: "group",
        icon: "icon-navigation",
        children: [
          {
            id: "dashboard",
            title: "Dashboard",
            type: "item",
            icon: "material-icons-two-tone",
            iconname: "home",
            url: "dashboard",
          },
          {
            id: "view",
            title: "View",
            type: "item",
            icon: "material-icons-two-tone",
            iconname: "remove_red_eye",
            url: "View_all_accounts_tender",
          },
          {
            id: "emd_tender_fee",
            title: "EMD Tender Fee",
            type: "item",
            icon: "material-icons-two-tone",
            iconname: "payment",
            url: "/Emd_tender_fee_request",
          },
          {
            id: "emd_refund",
            title: "Emd Refund",
            type: "item",
            icon: "material-icons-two-tone",
            iconname: "money_off",
            url: "/Emd_refund",
          },
          // {
          //   id: "performance_gurantee",
          //   title: "Performance gurantee",
          //   type: "item",
          //   icon: "material-icons-two-tone",
          //   iconname: "money_off",
          //   url: "/Performance_gurantee",
          // },
        ],
      },
    ],
  };
}

export default menuItems;
