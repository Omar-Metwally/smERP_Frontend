import 'src/global.css';
import { Router } from 'src/routes/sections';
import { useScrollToTop } from 'src/hooks/use-scroll-to-top';
import { ThemeProvider } from 'src/theme/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { PopupProvider } from './contexts/PopupContext';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();

  const queryClient = new QueryClient()

  // const githubButton = (
  //   <Fab
  //     size="medium"
  //     aria-label="Github"
  //     href="https://github.com/minimal-ui-kit/material-kit-react"
  //     sx={{
  //       zIndex: 9,
  //       right: 20,
  //       bottom: 20,
  //       width: 44,
  //       height: 44,
  //       position: 'fixed',
  //       bgcolor: 'grey.800',
  //       color: 'common.white',
  //     }}
  //   >
  //     <Iconify width={24} icon="eva:github-fill" />
  //   </Fab>
  // );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PopupProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Router />
            </LocalizationProvider>
          </PopupProvider>
        </AuthProvider>
      </QueryClientProvider>
      {/* {githubButton} */}
    </ThemeProvider>
  );
}
