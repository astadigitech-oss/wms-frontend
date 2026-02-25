// "use client";

// import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
// import { ButtonSidebar } from "../button-sidebar";
// import {
//   BadgeDollarSign,
//   BarChartBig,
//   Blocks,
//   BookMarked,
//   Boxes,
//   CandlestickChart,
//   CircleDashed,
//   ClipboardMinus,
//   Drill,
//   FileCog,
//   FolderClock,
//   IdCard,
//   LibraryBigIcon,
//   LineChart,
//   PackageSearch,
//   RailSymbol,
//   Recycle,
//   ScanText,
//   Shield,
//   ShoppingBasket,
//   SquareLibrary,
//   SwatchBook,
//   Target,
//   TriangleAlert,
//   Truck,
//   User,
//   Warehouse,
// } from "lucide-react";
// import { getCookie, hasCookie } from "cookies-next/client";

// interface MenuInboundProps {
//   pathname: string;
//   setOpen?: Dispatch<SetStateAction<boolean>>;
// }

// type Role =
//   | "ADMIN"
//   | "SPV"
//   | "TEAM_LEADER"
//   | "KASIR_LEADER"
//   | "ADMIN_KASIR"
//   | "CREW"
//   | "REPARASI"
//   | "DEVELOPER";

// interface SubMenu {
//   title: string;
//   href: string;
//   roles?: Role[];
// }

// interface MenuItem {
//   title: string;
//   href?: string;
//   icon?: React.ReactNode;
//   query?: string;
//   roles?: Role[];
//   sub_menu: SubMenu[];
// }

// interface MenuGroup {
//   id: number;
//   title: string;
//   href?: string;
//   roles?: Role[];
//   menu: MenuItem[];
// }

// const sidebarMenu: MenuGroup[] = [
//   {
//     id: 1,
//     title: "dashboard",
//     href: undefined,
//     menu: [
//       {
//         title: "Storage Report",
//         href: "/dashboard/storage-report",
//         icon: <LineChart className="w-5 h-5 stroke-[1.5]" />,
//         query: "storage-report",
//         roles: ["ADMIN", "SPV", "TEAM_LEADER", "ADMIN_KASIR"],
//         sub_menu: [],
//       },
//       {
//         title: "General Sale",
//         href: "/dashboard/general-sale",
//         icon: <BarChartBig className="w-5 h-5 stroke-[1.5]" />,
//         query: "general-sale",
//         roles: ["ADMIN", "SPV", "TEAM_LEADER", "ADMIN_KASIR"],
//         sub_menu: [],
//       },
//       {
//         title: "Analytic Sale",
//         href: "/dashboard/analytic-sale",
//         icon: <CandlestickChart className="w-5 h-5 stroke-[1.5]" />,
//         query: "analytic-sale",
//         roles: ["ADMIN", "SPV", "TEAM_LEADER", "ADMIN_KASIR"],
//         sub_menu: [],
//       },
//       {
//         title: "Summary Report",
//         href: undefined,
//         icon: <ClipboardMinus className="w-5 h-5 stroke-[1.5]" />,
//         sub_menu: [
//           {
//             title: "Product combined",
//             href: "/dashboard/summary-report/product-combined",
//             roles: [
//               "ADMIN",
//               "SPV",
//               "TEAM_LEADER",
//               "KASIR_LEADER",
//               "ADMIN_KASIR",
//               "CREW",
//               "REPARASI",
//               "DEVELOPER",
//             ],
//           },
//           // {
//           //   title: "Product Inbound",
//           //   href: "/dashboard/summary-report/product-inbound",
//           // },
//           // {
//           //   title: "Product Outbound",
//           //   href: "/dashboard/summary-report/product-outbound",
//           // },
//         ],
//       },
//     ],
//   },
//   {
//     id: 2,
//     title: "inbound",
//     href: undefined,
//     menu: [
//       {
//         title: "Inbound Process",
//         href: "/inbound/inbound-process",
//         icon: <FileCog className="w-5 h-5 stroke-[1.5]" />,
//         roles: ["ADMIN", "SPV", "TEAM_LEADER"],
//         sub_menu: [],
//       },
//       {
//         title: "Bulking Product",
//         href: "/inbound/bulking-product",
//         icon: <Target className="w-5 h-5 stroke-[1.5]" />,
//         roles: ["ADMIN", "SPV", "TEAM_LEADER"],
//         sub_menu: [],
//       },
//       {
//         title: "Check Product",
//         href: undefined,
//         icon: <PackageSearch className="w-5 h-5 stroke-[1.5]" />,
//         sub_menu: [
//           {
//             title: "Manifest Inbound",
//             href: "/inbound/check-product/manifest-inbound",
//             roles: ["ADMIN", "SPV", "TEAM_LEADER", "CREW"],
//           },
//           {
//             title: "Product Approve",
//             href: "/inbound/check-product/product-approve",
//             roles: ["ADMIN", "SPV", "TEAM_LEADER", "KASIR_LEADER"],
//           },
//           {
//             title: "Manual Inbound",
//             href: "/inbound/check-product/manual-inbound",
//             roles: ["ADMIN", "SPV", "TEAM_LEADER"],
//           },
//           {
//             title: "Scan Result",
//             href: "/inbound/check-product/scan-result",
//             roles: ["ADMIN", "SPV", "TEAM_LEADER", "CREW"],
//           },
//           {
//             title: "Product Input",
//             href: "/inbound/check-product/product-input",
//             roles: ["ADMIN", "SPV", "TEAM_LEADER", "CREW", "DEVELOPER"],
//           },
//         ],
//       },
//       {
//         title: "Check History",
//         href: "/inbound/check-history",
//         icon: <FolderClock className="w-5 h-5 stroke-[1.5]" />,
//         query: "check-history",
//         roles: ["ADMIN", "SPV", "TEAM_LEADER"],
//         sub_menu: [],
//       },
//       //  {
//       //   title: "BKL",
//       //   href: "/inbound/bkl",
//       //   icon: <Target className="w-5 h-5 stroke-[1.5]" />,
//       //   sub_menu: [],
//       // },
//     ],
//   },
//   {
//     id: 3,
//     title: "Stagging",
//     href: undefined,
//     menu: [
//       // {
//       //   title: "Product Stagging",
//       //   href: "/stagging/product",
//       //   icon: <Layers3 className="w-5 h-5 stroke-[1.5]" />,
//       //   sub_menu: [],
//       // },
//       {
//         title: "Approvement Stagging",
//         href: "/stagging/approvement",
//         icon: <SquareLibrary className="w-5 h-5 stroke-[1.5]" />,
//         roles: ["ADMIN", "SPV", "KASIR_LEADER", "TEAM_LEADER"],
//         sub_menu: [],
//       },
//       {
//         title: "Stagging",
//         href: "/stagging/rack",
//         icon: <LibraryBigIcon className="w-5 h-5 stroke-[1.5]" />,
//         roles: ["ADMIN", "SPV", "TEAM_LEADER", "KASIR_LEADER"],
//         sub_menu: [],
//       },
//     ],
//   },
//   {
//     id: 4,
//     title: "inventory",
//     href: undefined,
//     menu: [
//       {
//         title: "Product",
//         href: undefined,
//         icon: <Boxes className="w-5 h-5 stroke-[1.5]" />,
//         sub_menu: [
//           // {
//           //   title: "by category",
//           //   href: "/inventory/product/category",
//           // },
//           {
//             title: "by color",
//             href: "/inventory/product/color",
//             roles: ["ADMIN", "SPV", "TEAM_LEADER"],
//           },
//           {
//             title: "by category",
//             href: "/inventory/product/rack",
//             roles: ["ADMIN", "SPV", "TEAM_LEADER", "KASIR_LEADER"],
//           },
//         ],
//       },
//       {
//         title: "Category Setting",
//         href: undefined,
//         icon: <Blocks className="w-5 h-5 stroke-[1.5]" />,
//         roles: ["ADMIN", "SPV"],
//         sub_menu: [
//           {
//             title: "sub category",
//             href: "/inventory/category-setting/sub-category",
//             roles: ["ADMIN", "SPV"],
//           },
//           {
//             title: "tag color",
//             href: "/inventory/category-setting/tag-color",
//             roles: ["ADMIN", "SPV"],
//           },
//         ],
//       },
//       {
//         title: "Moving Product",
//         href: undefined,
//         icon: <RailSymbol className="w-5 h-5 stroke-[1.5]" />,
//         sub_menu: [
//           {
//             title: "bundle",
//             href: "/inventory/moving-product/bundle",
//             roles: ["ADMIN", "SPV", "TEAM_LEADER", "CREW"],
//           },
//           {
//             title: "repair",
//             href: "/inventory/moving-product/repair",
//             roles: [
//               "ADMIN",
//               "SPV",
//               "TEAM_LEADER",
//               "ADMIN_KASIR",
//               "KASIR_LEADER",
//               "REPARASI",
//             ],
//           },
//         ],
//       },
//       {
//         title: "Slow Moving Product",
//         href: undefined,
//         icon: <Warehouse className="w-5 h-5 stroke-[1.5]" />,
//         sub_menu: [
//           // {
//           //   title: "list product",
//           //   href: "/inventory/slow-moving-product/list-product",
//           // },
//           {
//             title: "promo product",
//             href: "/inventory/slow-moving-product/promo-product",
//             roles: ["ADMIN", "SPV", "TEAM_LEADER", "KASIR_LEADER"],
//           },
//           {
//             title: "BKL",
//             href: "/inventory/slow-moving-product/bkl",
//             roles: ["ADMIN", "SPV", "TEAM_LEADER", "CREW"],
//           },
//         ],
//       },
//       {
//         title: "Stock Opname",
//         href: undefined,
//         icon: <BookMarked className="w-5 h-5 stroke-[1.5]" />,
//         sub_menu: [
//           {
//             title: "Color",
//             href: "/inventory/stock-opname/color",
//             roles: ["ADMIN", "SPV", "TEAM_LEADER"],
//           },
//           // {
//           //   title: "Category",
//           //   href: "/inventory/stock-opname/category",
//           //   roles: ["ADMIN", "SPV"],
//           // },
//         ],
//       },
//     ],
//   },
//   {
//     id: 5,
//     title: "Repair Station",
//     href: undefined,
//     menu: [
//       // {
//       //   title: "List Product Repair",
//       //   href: "/repair-station/list-product-repair",
//       //   icon: <Drill className="w-5 h-5 stroke-[1.5]" />,
//       //   sub_menu: [],
//       // },
//       {
//         title: "migrate To Repair",
//         href: "/repair-station/migrate-to-repair",
//         icon: <Drill className="w-5 h-5 stroke-[1.5]" />,
//         roles: ["ADMIN", "SPV", "TEAM_LEADER", "KASIR_LEADER", "REPARASI", "ADMIN_KASIR"],
//         sub_menu: [],
//       },
//       {
//         title: "Abnormal",
//         href: "/repair-station/abnormal",
//         icon: <TriangleAlert className="w-5 h-5 stroke-[1.5]" />,
//         roles: ["ADMIN", "SPV", "TEAM_LEADER", "REPARASI"],
//         sub_menu: [],
//       },
//       {
//         title: "Damaged",
//         href: "/repair-station/damaged",
//         icon: <Shield className="w-5 h-5 stroke-[1.5]" />,
//         sub_menu: [],
//         roles: ["ADMIN", "SPV", "TEAM_LEADER", "REPARASI"],
//       },
//       {
//         title: "Non",
//         href: "/repair-station/non",
//         icon: <CircleDashed className="w-5 h-5 stroke-[1.5]" />,
//         roles: ["ADMIN", "SPV", "TEAM_LEADER", "REPARASI"],
//         sub_menu: [],
//       },
//     ],
//   },
//   {
//     id: 6,
//     title: "outbond",
//     href: undefined,
//     menu: [
//       {
//         title: "migrate color",
//         href: undefined,
//         icon: <Truck className="w-5 h-5 stroke-[1.5]" />,
//         sub_menu: [
//           {
//             title: "List Migrate",
//             href: "/outbond/migrate-color/list",
//             roles: [
//               "ADMIN",
//               "SPV",
//               "TEAM_LEADER",
//             ],
//           },
//           {
//             title: "destination",
//             href: "/outbond/migrate-color/destination",
//             roles: [
//               "ADMIN",
//               "SPV",
//               "TEAM_LEADER",
//             ],
//           },
//         ],
//       },
//       {
//         title: "sale",
//         href: "/outbond/sale",
//         icon: <ShoppingBasket className="w-5 h-5 stroke-[1.5]" />,
//         roles: ["ADMIN", "SPV", "ADMIN_KASIR", "KASIR_LEADER"],
//         sub_menu: [],
//       },
//       {
//         title: "B2B",
//         href: "/outbond/b2b",
//         icon: <ScanText className="w-5 h-5 stroke-[1.5]" />,
//         roles: ["ADMIN", "SPV", "TEAM_LEADER", "CREW"],
//         sub_menu: [],
//       },
//       {
//         title: "buyer",
//         href: "/outbond/buyer",
//         icon: <BadgeDollarSign className="w-5 h-5 stroke-[1.5]" />,
//         roles: ["ADMIN", "SPV", "ADMIN_KASIR", "KASIR_LEADER"],
//         sub_menu: [],
//       },
//       // {
//       //   title: "Class buyer",
//       //   href: "/outbond/class-buyer",
//       //   icon: <Award className="w-5 h-5 stroke-[1.5]" />,
//       //   sub_menu: [],
//       // },
//       {
//         title: "QCD",
//         href: "/outbond/qcd",
//         icon: <Recycle className="w-5 h-5 stroke-[1.5]" />,
//         roles: ["ADMIN", "SPV", "REPARASI"],
//         sub_menu: [],
//       },
//       {
//         title: "Pallet Bulky",
//         href: undefined,
//         icon: <SwatchBook className="w-5 h-5 stroke-[1.5]" />,
//         sub_menu: [
//           {
//             title: "list Pallet",
//             href: "/outbond/pallet/list",
//             roles: ["ADMIN", "SPV", "TEAM_LEADER", "CREW"],
//           },
//           {
//             title: "Category Pallet",
//             href: "/outbond/pallet/category-pallet",
//             roles: ["ADMIN", "SPV", "TEAM_LEADER"],
//           },
//           {
//             title: "Warehouse",
//             href: "/outbond/pallet/warehouse",
//             roles: ["ADMIN", "SPV", "TEAM_LEADER", "DEVELOPER"],
//           },
//           {
//             title: "Condition",
//             href: "/outbond/pallet/condition",
//             roles: ["ADMIN", "SPV", "TEAM_LEADER", "DEVELOPER"],
//           },
//           {
//             title: "Status",
//             href: "/outbond/pallet/status",
//             roles: ["ADMIN", "SPV", "TEAM_LEADER", "DEVELOPER"],
//           },
//           {
//             title: "Brand",
//             href: "/outbond/pallet/brand",
//             roles: ["ADMIN", "SPV", "TEAM_LEADER", "DEVELOPER"],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: 7,
//     title: "Account",
//     href: undefined,
//     menu: [
//       {
//         title: "Account Setting",
//         href: "/account/setting",
//         icon: <User className="w-5 h-5 stroke-[1.5]" />,
//         roles: ["ADMIN", "SPV"],
//         sub_menu: [],
//       },
//       {
//         title: "Panel SPV",
//         href: "/account/panel-spv",
//         icon: <IdCard className="w-5 h-5 stroke-[1.5]" />,
//         roles: ["ADMIN", "SPV"],
//         sub_menu: [],
//       },
//     ],
//   },
// ];

// const MenuInbound = ({ pathname, setOpen }: MenuInboundProps) => {
//   const [openMenu, setOpenMenu] = useState<string>("");
//   const [openSubMenu, setOpenSubMenu] = useState<string>("");
//   const [profileData, setProfileData] = useState<any>(null);

//   useEffect(() => {
//     if (hasCookie("profile")) {
//       const data = JSON.parse(getCookie("profile") ?? "{}");
//       setProfileData(data);
//     }
//   }, []);

//   const role = profileData?.role_name?.toUpperCase() as Role;

//   const hasAccess = (roles?: Role[]) => {
//     if (!roles || roles.length === 0) return true; // ⬅️ SEMUA ROLE
//     return roles.includes(role);
//   };

//   const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

//   const collectRolesFromMenuItem = (menu: MenuItem): Role[] => {
//     const roles: Role[] = [];

//     // roles langsung di menu (jika ada & tidak punya sub_menu)
//     if (menu.roles && menu.sub_menu.length === 0) {
//       roles.push(...menu.roles);
//     }

//     // ambil dari sub_menu
//     if (menu.sub_menu.length > 0) {
//       menu.sub_menu.forEach((sub) => {
//         if (sub.roles) {
//           roles.push(...sub.roles);
//         }
//       });
//     }

//     return uniq(roles);
//   };

//   const buildSidebarRoles = (menus: MenuGroup[]): MenuGroup[] => {
//     return menus.map((group) => {
//       const menuWithRoles = group.menu.map((menu) => {
//         const roles = collectRolesFromMenuItem(menu);

//         return {
//           ...menu,
//           roles,
//         };
//       });
//       const groupRoles = uniq(
//         menuWithRoles.flatMap((menu) => menu.roles ?? [])
//       );
//       return {
//         ...group,
//         roles: groupRoles,
//         menu: menuWithRoles,
//       };
//     });
//   };
//   const sidebarMenuWithRoles = buildSidebarRoles(sidebarMenu);

//   const filteredSidebarMenu = sidebarMenuWithRoles
//     .filter((group) => hasAccess(group.roles))
//     .map((group) => ({
//       ...group,
//       menu: group.menu
//         .filter((menu) => hasAccess(menu.roles))
//         .map((menu) => ({
//           ...menu,
//           sub_menu: menu.sub_menu.filter((sub) => hasAccess(sub.roles)),
//         })),
//     }));

//   return (
//     <div className="flex flex-col h-full w-full gap-1 relative">
//       {filteredSidebarMenu.map((item) => (
//         <div
//           key={item.id}
//           className="flex flex-col gap-1 items-center w-full last:pb-20"
//         >
//           {item.title !== undefined && (
//             <div className="h-10 flex justify-start items-center w-full px-6 bg-sky-300/70">
//               <h3 className="text-sm uppercase font-semibold text-sky-900">
//                 {item.title}
//               </h3>
//             </div>
//           )}
//           <div className="flex flex-col gap-1 w-full px-3">
//             {item.menu.map((item, i) => (
//               <ButtonSidebar
//                 key={item.title + i}
//                 label={item.title}
//                 icon={item.icon}
//                 href={item.href}
//                 query={item.query}
//                 pathname={pathname}
//                 sidebarMenu={sidebarMenu}
//                 subMenu={item.sub_menu}
//                 setOpenMenu={setOpenMenu}
//                 openMenu={openMenu}
//                 setOpenSubMenu={setOpenSubMenu}
//                 openSubMenu={openSubMenu}
//                 setOpen={setOpen}
//               />
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default MenuInbound;

"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import { ButtonSidebar } from "../button-sidebar";
import {
  BadgeDollarSign,
  BarChartBig,
  Blocks,
  BookMarked,
  Boxes,
  CandlestickChart,
  CircleDashed,
  ClipboardMinus,
  Drill,
  File,
  FileCog,
  FolderClock,
  IdCard,
  LibraryBigIcon,
  LineChart,
  PackageSearch,
  RailSymbol,
  Recycle,
  ScanText,
  Shield,
  ShoppingBasket,
  SquareLibrary,
  SwatchBook,
  Target,
  TriangleAlert,
  Truck,
  User,
  Warehouse,
} from "lucide-react";

interface MenuInboundProps {
  pathname: string;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

const sidebarMenu = [
  {
    id: 1,
    title: "dashboard",
    href: undefined,
    menu: [
      {
        title: "Storage Report",
        href: "/dashboard/storage-report",
        icon: <LineChart className="w-5 h-5 stroke-[1.5]" />,
        query: "storage-report",
        sub_menu: [],
      },
      {
        title: "General Sale",
        href: "/dashboard/general-sale",
        icon: <BarChartBig className="w-5 h-5 stroke-[1.5]" />,
        query: "general-sale",
        sub_menu: [],
      },
      {
        title: "Analytic Sale",
        href: "/dashboard/analytic-sale",
        icon: <CandlestickChart className="w-5 h-5 stroke-[1.5]" />,
        query: "analytic-sale",
        sub_menu: [],
      },
      {
        title: "Summary Report",
        href: undefined,
        icon: <ClipboardMinus className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [
          {
            title: "Product combined",
            href: "/dashboard/summary-report/product-combined",
          },
          // {
          //   title: "Product Inbound",
          //   href: "/dashboard/summary-report/product-inbound",
          // },
          // {
          //   title: "Product Outbound",
          //   href: "/dashboard/summary-report/product-outbound",
          // },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "inbound",
    href: undefined,
    menu: [
      {
        title: "Inbound Process",
        href: "/inbound/inbound-process",
        icon: <FileCog className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [],
      },
      {
        title: "Inbound Process SKU",
        href: "/inbound/inbound-process-sku",
        icon: <File className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [],
      },
      {
        title: "Bulking Product",
        href: "/inbound/bulking-product",
        icon: <Target className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [],
      },
      {
        title: "Check Product",
        href: undefined,
        icon: <PackageSearch className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [
          {
            title: "Manifest Inbound",
            href: "/inbound/check-product/manifest-inbound",
          },
          {
            title: "Manifest Inbound SKU",
            href: "/inbound/check-product/manifest-inbound-sku",
          },
          {
            title: "Product Approve",
            href: "/inbound/check-product/product-approve",
          },
          {
            title: "Manual Inbound",
            href: "/inbound/check-product/manual-inbound",
          },
          {
            title: "Scan Result",
            href: "/inbound/check-product/scan-result",
          },
          {
            title: "Product Input",
            href: "/inbound/check-product/product-input",
          },
        ],
      },
      {
        title: "Check History",
        href: "/inbound/check-history",
        icon: <FolderClock className="w-5 h-5 stroke-[1.5]" />,
        query: "check-history",
        sub_menu: [],
      },
      //  {
      //   title: "BKL",
      //   href: "/inbound/bkl",
      //   icon: <Target className="w-5 h-5 stroke-[1.5]" />,
      //   sub_menu: [],
      // },
    ],
  },
  {
    id: 3,
    title: "Stagging",
    href: undefined,
    menu: [
      // {
      //   title: "Product Stagging",
      //   href: "/stagging/product",
      //   icon: <Layers3 className="w-5 h-5 stroke-[1.5]" />,
      //   sub_menu: [],
      // },
      {
        title: "Approvement Stagging",
        href: "/stagging/approvement",
        icon: <SquareLibrary className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [],
      },
      {
        title: "Stagging",
        href: "/stagging/rack",
        icon: <LibraryBigIcon className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [],
      },
    ],
  },
  {
    id: 4,
    title: "inventory",
    href: undefined,
    menu: [
      {
        title: "Product",
        href: undefined,
        icon: <Boxes className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [
          // {
          //   title: "by category",
          //   href: "/inventory/product/category",
          // },
          {
            title: "by color",
            href: "/inventory/product/color",
          },
          {
            title: "by category",
            href: "/inventory/product/rack",
          },
          {
            title: "by sku",
            href: "/inventory/product/sku",
          },
        ],
      },
      {
        title: "Category Setting",
        href: undefined,
        icon: <Blocks className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [
          {
            title: "sub category",
            href: "/inventory/category-setting/sub-category",
          },
          {
            title: "tag color",
            href: "/inventory/category-setting/tag-color",
          },
        ],
      },
      {
        title: "Moving Product",
        href: undefined,
        icon: <RailSymbol className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [
          {
            title: "bundle",
            href: "/inventory/moving-product/bundle",
          },
          {
            title: "repair",
            href: "/inventory/moving-product/repair",
          },
        ],
      },
      {
        title: "Slow Moving Product",
        href: undefined,
        icon: <Warehouse className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [
          // {
          //   title: "list product",
          //   href: "/inventory/slow-moving-product/list-product",
          // },
          {
            title: "promo product",
            href: "/inventory/slow-moving-product/promo-product",
          },
          {
            title: "BKL",
            href: "/inventory/slow-moving-product/bkl",
          },
        ],
      },
      {
        title: "Stock Opname",
        href: undefined,
        icon: <BookMarked className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [
          {
            title: "Color",
            href: "/inventory/stock-opname/color",
          },
          // {
          //   title: "Category",
          //   href: "/inventory/stock-opname/category",
          // },
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Repair Station",
    href: undefined,
    menu: [
      // {
      //   title: "List Product Repair",
      //   href: "/repair-station/list-product-repair",
      //   icon: <Drill className="w-5 h-5 stroke-[1.5]" />,
      //   sub_menu: [],
      // },
      {
        title: "migrate To Repair",
        href: "/repair-station/migrate-to-repair",
        icon: <Drill className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [],
      },
      {
        title: "Abnormal",
        href: "/repair-station/abnormal",
        icon: <TriangleAlert className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [],
      },
      {
        title: "Damaged",
        href: "/repair-station/damaged",
        icon: <Shield className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [],
      },
      {
        title: "Non",
        href: "/repair-station/non",
        icon: <CircleDashed className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [],
      },
    ],
  },
  {
    id: 6,
    title: "outbond",
    href: undefined,
    menu: [
      {
        title: "migrate color",
        href: undefined,
        icon: <Truck className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [
          {
            title: "List Migrate",
            href: "/outbond/migrate-color/list",
          },
          {
            title: "destination",
            href: "/outbond/migrate-color/destination",
          },
        ],
      },
      {
        title: "sale",
        href: "/outbond/sale",
        icon: <ShoppingBasket className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [],
      },
      {
        title: "B2B",
        href: "/outbond/b2b",
        icon: <ScanText className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [],
      },
      //    {
      //   title: "Cargo",
      //   href: "/outbond/cargo",
      //   icon: <Truck className="w-5 h-5 stroke-[1.5]" />,
      //   sub_menu: [],
      // },
      {
        title: "buyer",
        href: "/outbond/buyer",
        icon: <BadgeDollarSign className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [],
      },
      // {
      //   title: "Class buyer",
      //   href: "/outbond/class-buyer",
      //   icon: <Award className="w-5 h-5 stroke-[1.5]" />,
      //   sub_menu: [],
      // },
      {
        title: "QCD",
        href: "/outbond/qcd",
        icon: <Recycle className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [],
      },
      {
        title: "Pallet Bulky",
        href: undefined,
        icon: <SwatchBook className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [
          {
            title: "list Pallet",
            href: "/outbond/pallet/list",
          },
          {
            title: "Category Pallet",
            href: "/outbond/pallet/category-pallet",
          },
          {
            title: "Warehouse",
            href: "/outbond/pallet/warehouse",
          },
          {
            title: "Condition",
            href: "/outbond/pallet/condition",
          },
          {
            title: "Status",
            href: "/outbond/pallet/status",
          },
          {
            title: "Brand",
            href: "/outbond/pallet/brand",
          },
        ],
      },
    ],
  },
  {
    id: 7,
    title: "Account",
    href: undefined,
    menu: [
      {
        title: "Account Setting",
        href: "/account/setting",
        icon: <User className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [],
      },
      {
        title: "Panel SPV",
        href: "/account/panel-spv",
        icon: <IdCard className="w-5 h-5 stroke-[1.5]" />,
        sub_menu: [],
      },
    ],
  },
];

const MenuInbound = ({ pathname, setOpen }: MenuInboundProps) => {
  const [openMenu, setOpenMenu] = useState<string>("");
  const [openSubMenu, setOpenSubMenu] = useState<string>("");
  return (
    <div className="flex flex-col h-full w-full gap-1 relative">
      {sidebarMenu.map((item) => (
        <div
          key={item.id}
          className="flex flex-col gap-1 items-center w-full last:pb-20"
        >
          {item.title !== undefined && (
            <div className="h-10 flex justify-start items-center w-full px-6 bg-sky-300/70">
              <h3 className="text-sm uppercase font-semibold text-sky-900">
                {item.title}
              </h3>
            </div>
          )}
          <div className="flex flex-col gap-1 w-full px-3">
            {item.menu.map((item, i) => (
              <ButtonSidebar
                key={item.title + i}
                label={item.title}
                icon={item.icon}
                href={item.href}
                query={item.query}
                pathname={pathname}
                sidebarMenu={sidebarMenu}
                subMenu={item.sub_menu}
                setOpenMenu={setOpenMenu}
                openMenu={openMenu}
                setOpenSubMenu={setOpenSubMenu}
                openSubMenu={openSubMenu}
                setOpen={setOpen}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuInbound;
