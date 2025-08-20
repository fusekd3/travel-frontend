import { Box, Flex, Heading, Spacer, Link, Button, HStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Header() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOutUser();
    router.push('/');
  };

  return (
    <Box as="header" w="100%" bg="whiteAlpha.900" boxShadow="sm" position="fixed" top={0} left={0} zIndex={10}>
      <Flex maxW="container.lg" mx="auto" px={4} py={3} align="center">
        <Heading as="h1" size="md" letterSpacing="tight">
          <Link as={NextLink} href="/" _hover={{ textDecoration: 'none', color: 'teal.500' }}>
            Travell AI
          </Link>
        </Heading>
        <HStack as="nav" spacing={6} ml={8} display={{ base: 'none', md: 'flex' }}>
          <Link as={NextLink} href="/search" fontWeight="medium" color="gray.700" _hover={{ color: 'teal.500' }}>
            여행지 찾기
          </Link>
          <Link as={NextLink} href="/ai" fontWeight="medium" color="gray.700" _hover={{ color: 'teal.500' }}>
            AI 추천
          </Link>
          <Link as={NextLink} href="/booking" fontWeight="medium" color="gray.700" _hover={{ color: 'teal.500' }}>
            숙박 예매
          </Link>
          <Link as={NextLink} href="/review" fontWeight="medium" color="gray.700" _hover={{ color: 'teal.500' }}>
            리뷰
          </Link>
          <Link as={NextLink} href="/event" fontWeight="medium" color="gray.700" _hover={{ color: 'teal.500' }}>
            이벤트
          </Link>
          <Link as={NextLink} href="/customer-service" fontWeight="medium" color="gray.700" _hover={{ color: 'teal.500' }}>
            고객센터
          </Link>
        </HStack>
        <Spacer />
        <HStack spacing={4}>
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
      </Flex>
    </Box>
  );
} 