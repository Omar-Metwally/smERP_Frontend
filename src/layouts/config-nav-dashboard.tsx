import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'User',
    path: '/user',
    icon: icon('ic-user'),
  },
  {
    title: 'Branch',
    path: '/branch',
    icon: icon('ic-branch'),
  },
  {
    title: 'Brand',
    path: '/brand',
    icon: icon('ic-brand'),
  },
  {
    title: 'Category',
    path: '/category',
    icon: icon('ic-category'),
  },
  {
    title: 'Attribute',
    path: '/attribute',
    icon: icon('ic-attribute'),
  },
  {
    title: 'Product',
    path: '/products',
    icon: icon('ic-cart'),
    // info: (
    //   <Label color="error" variant="inverted">
    //     +3
    //   </Label>
    // ),
  },
  {
    title: 'Supplier',
    path: '/supplier',
    icon: icon('ic-supplier'),
  },
  {
    title: 'Blog',
    path: '/blog',
    icon: icon('ic-blog'),
  },
  {
    title: 'Sign in',
    path: '/sign-in',
    icon: icon('ic-lock'),
  },
  {
    title: 'Not found',
    path: '/404',
    icon: icon('ic-disabled'),
  },
];
