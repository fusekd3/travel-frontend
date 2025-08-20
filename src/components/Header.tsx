import { Box, Flex, Heading, Spacer, Link, Button, HStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Header() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();

  // 현재 페이지 경로에 따라 헤더 글자 색상 결정
  const isMainPage = router.pathname === '/';
  const isAuthPage = ['/login', '/signup', '/mypage'].includes(router.pathname);
  
  // 메인 페이지나 인증 페이지에서는 흰색, 다른 페이지에서는 검은색
  const headerColor = isMainPage || isAuthPage ? 'white' : 'black';
  
  // 메인 페이지만 흰색 글자로 설정
  const finalHeaderColor = isMainPage ? 'white' : 'black';

  const handleLogout = async () => {
    await signOutUser();
    router.push('/');
  };

  return (
    <Box 
      as="header" 
      w="100%" 
      bg="transparent"
      position="fixed" 
      top={0} 
      left={0} 
      zIndex={50}
      sx={{ backgroundColor: 'transparent !important' }}
    >
      <Flex 
        maxW="container.lg" 
        mx="auto" 
        px={4} 
        py={3} 
        align="center"
        bg="transparent"
        sx={{ backgroundColor: 'transparent !important' }}
      >
        <Heading as="h1" size="md" letterSpacing="tight" color={finalHeaderColor}>
          <Link as={NextLink} href="/" _hover={{ textDecoration: 'none', color: 'teal.300' }}>
            Travell AI
          </Link>
        </Heading>
        <HStack as="nav" spacing={6} ml={8} display={{ base: 'none', md: 'flex' }}>
          <Link as={NextLink} href="/search" fontWeight="medium" color={finalHeaderColor} _hover={{ color: 'teal.300' }}>
            여행지 찾기
          </Link>
          <Link as={NextLink} href="/ai" fontWeight="medium" color={finalHeaderColor} _hover={{ color: 'teal.300' }}>
            AI 추천
          </Link>
          <Link as={NextLink} href="/booking" fontWeight="medium" color={finalHeaderColor} _hover={{ color: 'teal.300' }}>
            숙소 예약
          </Link>
          <Link as={NextLink} href="/review" fontWeight="medium" color={finalHeaderColor} _hover={{ color: 'teal.300' }}>
            리뷰
          </Link>
          <Link as={NextLink} href="/event" fontWeight="medium" color={finalHeaderColor} _hover={{ color: 'teal.300' }}>
            이벤트
          </Link>
          <Link as={NextLink} href="/customer-service" fontWeight="medium" color={finalHeaderColor} _hover={{ color: 'teal.300' }}>
            고객센터
          </Link>
        </HStack>
        <Spacer />
        <HStack spacing={4}>
          {user ? (
            <>
              <Button as={NextLink} href="/mypage" variant="ghost" colorScheme="teal" size="sm" color={finalHeaderColor} _hover={{ bg: 'rgba(255,255,255,0.1)' }}>
                마이페이지
              </Button>
              <Button variant="outline" colorScheme="teal" size="sm" onClick={handleLogout} bg="teal.500" color="white" borderColor="teal.500" _hover={{ bg: 'teal.600' }}>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button as={NextLink} href="/login" variant="ghost" colorScheme="teal" size="sm" color={headerColor} _hover={{ bg: 'rgba(255,255,255,0.1)' }}>
                로그인
              </Button>
              <Button as={NextLink} href="/signup" colorScheme="teal" size="sm" bg="teal.500" _hover={{ bg: 'teal.600' }}>
                회원가입
              </Button>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
