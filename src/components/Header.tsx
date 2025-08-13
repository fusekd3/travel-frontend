import { Box, Flex, Heading, Spacer, Link, Button, HStack, IconButton, useDisclosure, VStack, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { HiMenu } from 'react-icons/hi';

export default function Header() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLogout = async () => {
    await signOutUser();
    router.push('/');
    onClose();
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
  };

  const navigationItems = [
    { href: '/search', label: '여행지 찾기' },
    { href: '/ai', label: 'AI 추천' },
    { href: '/booking', label: '숙박 예매' },
    { href: '/review', label: '리뷰' },
    { href: '/event', label: '이벤트' },
    { href: '/customer-service', label: '고객센터' }
  ];

  return (
    <Box as="header" w="100%" bg="whiteAlpha.900" boxShadow="sm" position="fixed" top={0} left={0} zIndex={10}>
      <Flex maxW="container.lg" mx="auto" px={4} py={3} align="center">
        <Heading as="h1" size="md" letterSpacing="tight">
          <Link as={NextLink} href="/" _hover={{ textDecoration: 'none', color: 'teal.500' }}>
            Travell AI
          </Link>
        </Heading>
        
        {/* 데스크톱 네비게이션 */}
        <HStack as="nav" spacing={6} ml={8} display={{ base: 'none', md: 'flex' }}>
          {navigationItems.map((item) => (
            <Link 
              key={item.href}
              as={NextLink} 
              href={item.href} 
              fontWeight="medium" 
              color="gray.700" 
              _hover={{ color: 'teal.500' }}
            >
              {item.label}
            </Link>
          ))}
        </HStack>
        
        <Spacer />
        
        {/* 데스크톱 사용자 메뉴 */}
        <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
          {user ? (
            <>
              <Button as={NextLink} href="/mypage" variant="ghost" colorScheme="teal" size="sm">
                마이페이지
              </Button>
              <Button variant="outline" colorScheme="teal" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button as={NextLink} href="/login" variant="ghost" colorScheme="teal" size="sm">
                로그인
              </Button>
              <Button as={NextLink} href="/signup" colorScheme="teal" size="sm">
                회원가입
              </Button>
            </>
          )}
        </HStack>

        {/* 모바일 햄버거 메뉴 버튼 */}
        <IconButton
          aria-label="메뉴 열기"
          icon={<HiMenu size={24} />}
          variant="ghost"
          colorScheme="teal"
          size="lg"
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
          w={12}
          h={12}
          borderRadius="xl"
          _hover={{ 
            bg: 'teal.50', 
            transform: 'scale(1.05)',
            boxShadow: 'md'
          }}
          _active={{ 
            bg: 'teal.100',
            transform: 'scale(0.95)'
          }}
          transition="all 0.2s"
        />
      </Flex>

      {/* 모바일 사이드 메뉴 */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" color="teal.600">
            Travell AI 메뉴
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch" pt={4}>
              {/* 네비게이션 메뉴 */}
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  justifyContent="flex-start"
                  size="lg"
                  color="gray.700"
                  _hover={{ bg: 'teal.50', color: 'teal.600' }}
                  onClick={() => handleNavigation(item.href)}
                >
                  {item.label}
                </Button>
              ))}
              
              <Box borderTop="1px" borderColor="gray.200" pt={4} mt={4}>
                {/* 사용자 메뉴 */}
                {user ? (
                  <VStack spacing={3} align="stretch">
                    <Button
                      as={NextLink}
                      href="/mypage"
                      variant="ghost"
                      justifyContent="flex-start"
                      size="lg"
                      color="teal.600"
                      _hover={{ bg: 'teal.50' }}
                    >
                      마이페이지
                    </Button>
                    <Button
                      variant="outline"
                      colorScheme="teal"
                      size="lg"
                      onClick={handleLogout}
                    >
                      로그아웃
                    </Button>
                  </VStack>
                ) : (
                  <VStack spacing={3} align="stretch">
                    <Button
                      as={NextLink}
                      href="/login"
                      variant="ghost"
                      justifyContent="flex-start"
                      size="lg"
                      color="teal.600"
                      _hover={{ bg: 'teal.50' }}
                    >
                      로그인
                    </Button>
                    <Button
                      as={NextLink}
                      href="/signup"
                      colorScheme="teal"
                      size="lg"
                    >
                      회원가입
                    </Button>
                  </VStack>
                )}
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}