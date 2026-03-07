import requests
import sys
import json
from datetime import datetime

class FitStartBackendTester:
    def __init__(self, base_url="https://fitstart-auth.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, auth=True):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token and auth:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            
            result = {
                "test_name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_data": None,
                "error": None
            }

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    result["response_data"] = response.json()
                except:
                    result["response_data"] = response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    result["error"] = error_data
                    print(f"   Error: {error_data}")
                except:
                    result["error"] = response.text
                    print(f"   Error: {response.text}")

            self.test_results.append(result)
            return success, response.json() if success else {}

        except Exception as e:
            print(f"❌ Failed - Network/Connection Error: {str(e)}")
            result = {
                "test_name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": "ERROR",
                "success": False,
                "response_data": None,
                "error": str(e)
            }
            self.test_results.append(result)
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200,
            auth=False
        )
        return success

    def test_register_user(self, name, email, password):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "name": name,
                "email": email,
                "password": password,
                "confirm_password": password
            },
            auth=False
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response.get('user', {}).get('id')
            print(f"   📝 Registered user: {email}")
            return True
        return False

    def test_register_duplicate_user(self, email):
        """Test duplicate user registration (should fail)"""
        success, response = self.run_test(
            "Duplicate Registration (should fail)",
            "POST",
            "auth/register",
            400,
            data={
                "name": "Duplicate User",
                "email": email,
                "password": "TestPass123!",
                "confirm_password": "TestPass123!"
            },
            auth=False
        )
        return success

    def test_register_password_mismatch(self):
        """Test registration with mismatched passwords"""
        success, response = self.run_test(
            "Password Mismatch Registration (should fail)",
            "POST",
            "auth/register",
            400,
            data={
                "name": "Test User",
                "email": "mismatch@example.com",
                "password": "TestPass123!",
                "confirm_password": "DifferentPass123!"
            },
            auth=False
        )
        return success

    def test_login_user(self, email, password):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": email,
                "password": password
            },
            auth=False
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response.get('user', {}).get('id')
            print(f"   🔐 Logged in user: {email}")
            return True
        return False

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        success, response = self.run_test(
            "Invalid Login (should fail)",
            "POST",
            "auth/login",
            401,
            data={
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            },
            auth=False
        )
        return success

    def test_get_current_user(self):
        """Test getting current user profile"""
        if not self.token:
            print("❌ No token available for /me endpoint test")
            return False
            
        success, response = self.run_test(
            "Get Current User (/me)",
            "GET",
            "auth/me",
            200,
            auth=True
        )
        return success

    def test_get_me_without_token(self):
        """Test /me endpoint without authentication"""
        # Temporarily clear token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Get Current User Without Token (should fail)",
            "GET",
            "auth/me",
            422,  # FastAPI returns 422 for missing auth
            auth=False
        )
        
        # Restore token
        self.token = original_token
        return success

    def test_get_me_with_invalid_token(self):
        """Test /me endpoint with invalid token"""
        # Temporarily set invalid token
        original_token = self.token
        self.token = "invalid_token_12345"
        
        success, response = self.run_test(
            "Get Current User With Invalid Token (should fail)",
            "GET",
            "auth/me",
            401,
            auth=True
        )
        
        # Restore token
        self.token = original_token
        return success

    # ===== PURCHASE TESTS =====

    def test_create_free_starter_purchase(self):
        """Test creating a purchase for the free starter program"""
        if not self.token:
            print("❌ No token available for purchase test")
            return False
            
        success, response = self.run_test(
            "Create Free Starter Purchase",
            "POST",
            "purchases",
            200,
            data={
                "program_id": "free-starter",
                "program_name": "Free Starter",
                "price": 0.0
            },
            auth=True
        )
        
        if success:
            print(f"   ✨ Created purchase for Free Starter program")
        return success

    def test_create_duplicate_purchase(self):
        """Test creating duplicate purchase (should fail)"""
        if not self.token:
            print("❌ No token available for duplicate purchase test")
            return False
            
        success, response = self.run_test(
            "Duplicate Purchase (should fail)",
            "POST",
            "purchases",
            400,
            data={
                "program_id": "free-starter",
                "program_name": "Free Starter",
                "price": 0.0
            },
            auth=True
        )
        return success

    def test_get_user_purchases(self):
        """Test getting user's purchases"""
        if not self.token:
            print("❌ No token available for purchases list test")
            return False
            
        success, response = self.run_test(
            "Get User Purchases",
            "GET",
            "purchases",
            200,
            auth=True
        )
        
        if success and response:
            print(f"   📚 Found {len(response)} purchase(s)")
            for purchase in response:
                print(f"      - {purchase.get('program_name')} (${purchase.get('price')})")
        return success

    def test_get_specific_purchase(self):
        """Test getting a specific purchase by program ID"""
        if not self.token:
            print("❌ No token available for specific purchase test")
            return False
            
        success, response = self.run_test(
            "Get Specific Purchase (Free Starter)",
            "GET",
            "purchases/free-starter",
            200,
            auth=True
        )
        return success

    def test_get_nonexistent_purchase(self):
        """Test getting a nonexistent purchase (should fail)"""
        if not self.token:
            print("❌ No token available for nonexistent purchase test")
            return False
            
        success, response = self.run_test(
            "Get Nonexistent Purchase (should fail)",
            "GET",
            "purchases/nonexistent-program",
            404,
            auth=True
        )
        return success

    # ===== PROGRESS TESTS =====

    def test_mark_day_1_complete(self):
        """Test marking day 1 as complete"""
        if not self.token:
            print("❌ No token available for progress test")
            return False
            
        success, response = self.run_test(
            "Mark Day 1 Complete",
            "POST",
            "progress/free-starter/day/day-1",
            200,
            data={},
            auth=True
        )
        
        if success:
            print(f"   ✅ Marked day-1 as complete")
        return success

    def test_mark_day_2_complete(self):
        """Test marking day 2 as complete"""
        if not self.token:
            print("❌ No token available for progress test")
            return False
            
        success, response = self.run_test(
            "Mark Day 2 Complete",
            "POST",
            "progress/free-starter/day/day-2",
            200,
            data={},
            auth=True
        )
        
        if success:
            print(f"   ✅ Marked day-2 as complete")
        return success

    def test_mark_day_3_complete(self):
        """Test marking day 3 as complete"""
        if not self.token:
            print("❌ No token available for progress test")
            return False
            
        success, response = self.run_test(
            "Mark Day 3 Complete",
            "POST",
            "progress/free-starter/day/day-3",
            200,
            data={},
            auth=True
        )
        
        if success:
            print(f"   ✅ Marked day-3 as complete")
        return success

    def test_get_program_progress(self):
        """Test getting program progress"""
        if not self.token:
            print("❌ No token available for get progress test")
            return False
            
        success, response = self.run_test(
            "Get Program Progress",
            "GET",
            "progress/free-starter",
            200,
            auth=True
        )
        
        if success and response:
            print(f"   📊 Found progress for {len(response)} day(s)")
            for progress in response:
                day_id = progress.get('day_id', 'unknown')
                completed = progress.get('completed', False)
                completed_at = progress.get('completed_at', 'N/A')
                print(f"      - {day_id}: {'✅' if completed else '❌'} ({completed_at})")
        return success

    def test_mark_without_purchase(self):
        """Test marking progress without owning the program (should fail)"""
        if not self.token:
            print("❌ No token available for unauthorized progress test")
            return False
            
        success, response = self.run_test(
            "Mark Progress Without Purchase (should fail)",
            "POST",
            "progress/nonexistent-program/day/day-1",
            403,
            data={},
            auth=True
        )
        return success

def main():
    # Setup
    tester = FitStartBackendTester()
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    test_email = f"test_user_{timestamp}@example.com"
    test_password = "TestPass123!"
    test_name = f"Test User {timestamp}"

    print("🚀 Starting FitStart Backend API Tests")
    print(f"📡 Base URL: {tester.base_url}")
    print("="*60)

    # Test 1: Root endpoint
    tester.test_root_endpoint()

    # Test 2: User registration
    if not tester.test_register_user(test_name, test_email, test_password):
        print("❌ Registration failed, stopping dependent tests")
        print(f"\n📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
        return 1

    # Test 3: Duplicate registration (should fail)
    tester.test_register_duplicate_user(test_email)

    # Test 4: Registration with password mismatch (should fail)  
    tester.test_register_password_mismatch()

    # Test 5: User login
    tester.test_login_user(test_email, test_password)

    # Test 6: Invalid login (should fail)
    tester.test_login_invalid_credentials()

    # Test 7: Get current user profile
    tester.test_get_current_user()

    # Test 8: Get /me without token (should fail)
    tester.test_get_me_without_token()

    # Test 9: Get /me with invalid token (should fail)
    tester.test_get_me_with_invalid_token()

    # ===== PURCHASE TESTS =====
    
    # Test 10: Create Free Starter purchase
    if not tester.test_create_free_starter_purchase():
        print("❌ Free Starter purchase creation failed, continuing with other tests")
    
    # Test 11: Try to create duplicate purchase (should fail)
    tester.test_create_duplicate_purchase()
    
    # Test 12: Get user purchases
    tester.test_get_user_purchases()
    
    # Test 13: Get specific purchase
    tester.test_get_specific_purchase()
    
    # Test 14: Get nonexistent purchase (should fail)
    tester.test_get_nonexistent_purchase()

    # ===== PROGRESS TESTS =====
    
    # Test 15: Mark day 1 complete
    tester.test_mark_day_1_complete()
    
    # Test 16: Mark day 2 complete  
    tester.test_mark_day_2_complete()
    
    # Test 17: Mark day 3 complete
    tester.test_mark_day_3_complete()
    
    # Test 18: Get program progress
    tester.test_get_program_progress()
    
    # Test 19: Try to mark progress without owning program (should fail)
    tester.test_mark_without_purchase()

    # Print final results
    print("\n" + "="*60)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    print(f"✅ Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    # Show failed tests
    failed_tests = [test for test in tester.test_results if not test["success"]]
    if failed_tests:
        print("\n❌ Failed Tests:")
        for test in failed_tests:
            print(f"   - {test['test_name']}: {test['actual_status']} (expected {test['expected_status']})")
            if test['error']:
                print(f"     Error: {test['error']}")

    # Export detailed results to JSON
    results_file = f"/app/test_reports/backend_test_results_{timestamp}.json"
    with open(results_file, 'w') as f:
        json.dump({
            "summary": {
                "total_tests": tester.tests_run,
                "passed_tests": tester.tests_passed,
                "failed_tests": tester.tests_run - tester.tests_passed,
                "success_rate": (tester.tests_passed/tester.tests_run)*100,
                "timestamp": timestamp
            },
            "detailed_results": tester.test_results
        }, f, indent=2)
    
    print(f"\n📝 Detailed results saved to: {results_file}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())