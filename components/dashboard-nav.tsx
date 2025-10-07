'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  Building2,
  UserCog,
  Users,
  Calendar,
  ClipboardList,
  DollarSign,
  Search,
  User,
  LogOut,
  Stethoscope,
  Menu,
  Shield,
  Key
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionPayload } from '@/lib/auth/session';

interface DashboardNavProps {
  session: SessionPayload;
}

const navItems = [
  {
    title: 'Bölümler',
    href: '/departments',
    icon: Building2,
    adminOnly: true
  },
  {
    title: 'Doktorlar',
    href: '/doctors',
    icon: UserCog,
    adminOnly: true
  },
  {
    title: 'Hizmetler',
    href: '/services',
    icon: Stethoscope,
    adminOnly: true
  },
  {
    title: 'Hastalar',
    href: '/patients',
    icon: Users,
    adminOnly: false
  },
  {
    title: 'Randevular',
    href: '/appointments',
    icon: Calendar,
    adminOnly: false
  },
  {
    title: 'Gelişler',
    href: '/visits',
    icon: ClipboardList,
    adminOnly: false
  },
  {
    title: 'Tahsilatlar',
    href: '/payments',
    icon: DollarSign,
    adminOnly: false
  },
  {
    title: 'Hasta Sorgula',
    href: '/lookup',
    icon: Search,
    adminOnly: false
  }
];

export function DashboardNav({ session }: DashboardNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || session.role === 'admin'
  );

  return (
    <nav className='border-b border-blue-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm'>
      <div className='container mx-auto px-6'>
        <div className='flex h-16 items-center justify-between'>
          <div className='flex items-center gap-6'>
            <Link
              href='/'
              className='flex items-center space-x-2 group transition-all'
            >
              <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all'>
                <Stethoscope className='h-5 w-5 text-white' />
              </div>
              <span className='font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                Hastane Ön Büro
              </span>
            </Link>
            {/* Desktop Navigation */}
            <div className='hidden lg:flex items-center space-x-1'>
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size='sm'
                      className={cn(
                        'gap-2 transition-all',
                        isActive &&
                          'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg'
                      )}
                    >
                      <Icon className='h-4 w-4' />
                      {item.title}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile Menu and User Dropdown */}
          <div className='flex items-center gap-2'>
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='lg:hidden hover:bg-blue-100 dark:hover:bg-blue-950'
                >
                  <Menu className='h-5 w-5' />
                  <span className='sr-only'>Menüyü aç</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side='left'
                className='w-[280px] sm:w-[320px] bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-blue-200 dark:border-blue-900 flex flex-col'
              >
                <SheetHeader className='flex-shrink-0'>
                  <SheetTitle className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center'>
                      <Stethoscope className='h-5 w-5 text-white' />
                    </div>
                    <span className='text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                      Hastane Ön Büro
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <div className='mt-8 flex-1 overflow-y-auto flex flex-col gap-2 pr-2'>
                  {filteredNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant={isActive ? 'default' : 'ghost'}
                          className={cn(
                            'w-full justify-start gap-3 h-12 text-base',
                            isActive &&
                              'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                          )}
                        >
                          <Icon className='h-5 w-5' />
                          {item.title}
                        </Button>
                      </Link>
                    );
                  })}
                  <div className='mt-6 pt-6 border-t border-blue-200 dark:border-blue-800'>
                    <div className='flex items-center gap-3 px-3 py-2 mb-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg'>
                      <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-blue-200 dark:ring-blue-800'>
                        <User className='h-5 w-5 text-white' />
                      </div>
                      <div className='flex flex-col'>
                        <p className='text-sm font-semibold text-blue-900 dark:text-blue-100'>
                          {session.username}
                        </p>
                        <p className='text-xs text-blue-600 dark:text-blue-400 font-medium'>
                          {session.role === 'admin' ? 'Yönetici' : 'Resepsiyon'}
                        </p>
                      </div>
                    </div>
                    <div className='space-y-1'>
                      {session.role === 'admin' && (
                        <Link
                          href='/users'
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant='ghost'
                            className='w-full justify-start gap-3 h-12 text-base hover:bg-blue-100 dark:hover:bg-blue-950'
                          >
                            <Shield className='h-5 w-5' />
                            Kullanıcı Yönetimi
                          </Button>
                        </Link>
                      )}
                      <Link
                        href='/password'
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant='ghost'
                          className='w-full justify-start gap-3 h-12 text-base hover:bg-blue-100 dark:hover:bg-blue-950'
                        >
                          <Key className='h-5 w-5' />
                          Şifre Değiştir
                        </Button>
                      </Link>
                      <div className='pt-2'>
                        <Button
                          variant='ghost'
                          className='w-full justify-start gap-3 h-12 text-base text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30'
                          onClick={async () => {
                            setMobileMenuOpen(false);
                            await logout();
                          }}
                        >
                          <LogOut className='h-5 w-5' />
                          Çıkış Yap
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* User Dropdown (Desktop) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='gap-2 hover:bg-blue-100 dark:hover:bg-gray-800 hidden lg:flex'
                >
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center'>
                    <User className='h-4 w-4 text-white' />
                  </div>
                  <span className='hidden xl:inline-block font-medium'>
                    {session.username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-64'>
                <DropdownMenuLabel className='px-3 py-2'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-blue-200 dark:ring-blue-800'>
                      <User className='h-5 w-5 text-white' />
                    </div>
                    <div className='flex flex-col'>
                      <p className='text-sm font-semibold text-blue-900 dark:text-blue-100'>
                        {session.username}
                      </p>
                      <p className='text-xs text-blue-600 dark:text-blue-400 font-medium'>
                        {session.role === 'admin' ? 'Yönetici' : 'Resepsiyon'}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {session.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link
                      href='/users'
                      className='cursor-pointer flex items-center'
                    >
                      <Shield className='h-4 w-4 mr-2' />
                      <span>Kullanıcı Yönetimi</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link
                    href='/password'
                    className='cursor-pointer flex items-center'
                  >
                    <Key className='h-4 w-4 mr-2' />
                    <span>Şifre Değiştir</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer font-medium'
                  onClick={async () => {
                    await logout();
                  }}
                >
                  <LogOut className='h-4 w-4 mr-2' />
                  <span>Çıkış Yap</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
