<template>
  <div class="min-h-screen bg-[#F5F7F7] dark:bg-[#0B1220] pb-24">
    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm mx-4">
        <div class="flex flex-col items-center gap-4">
          <!-- Spinner -->
          <svg class="animate-spin h-12 w-12 text-[#10A9C7]" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          
          <!-- Message -->
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {{ loadingMessage }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Please wait, this may take a moment...
            </p>
          </div>
          
          <!-- Upload Progress (only for sellers with file) -->
          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="w-full">
            <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
              <span>Uploading document...</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-[#10A9C7] transition-all duration-300" :style="{ width: uploadProgress + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-xl mx-auto px-4">
      <div class="rounded-2xl shadow-md border p-8 md:p-10 mt-8
                  bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <h1 class="text-3xl font-extrabold text-center tracking-tight dark:text-gray-100">
          Create an account
        </h1>
        <p class="text-gray-500 dark:text-gray-400 text-center mt-2">
          Join our community of buyers and sellers!
        </p>
        <!-- Role -->
        <div class="grid grid-cols-2 gap-2 mt-6">
          <button type="button"
                  class="h-10 rounded-lg font-medium transition border"
                  :class="role==='buyer'
                    ? 'bg-[#10A9C7] text-white border-transparent'
                    : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600'"
                  @click="setRole('buyer')">
            I'm a Buyer
          </button>
          <button type="button"
                  class="h-10 rounded-lg font-medium transition border"
                  :class="role==='seller'
                    ? 'bg-[#10A9C7] text-white border-transparent'
                    : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600'"
                  @click="setRole('seller')">
            I'm a Seller
          </button>
        </div>

        <!-- ✅ Google Sign-Up -->
        <div class="mt-6 space-y-4">
          <button
            type="button"
            @click="onGoogleSignup"
            :disabled="loadingGoogle"
            class="w-full inline-flex items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold
                  border border-background-dark/15 dark:border-background-light/15
                  bg-white hover:bg-gray-50 dark:bg-[#0E1526] dark:hover:bg-[#111a2c]
                  text-background-dark dark:text-background-light
                  transition disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Sign up with Google">
            <img :src="googleLogo" alt="Google" class="h-5 w-5" />
            <span v-if="!loadingGoogle">Sign up with Google</span>
            <span v-else>Connecting…</span>
          </button>

          <!-- Divider -->
          <div class="flex items-center gap-4">
            <div class="h-px grow bg-background-dark/10 dark:bg-background-light/10"></div>
            <span class="text-xs text-background-dark/60 dark:text-background-light/60">OR</span>
            <div class="h-px grow bg-background-dark/10 dark:bg-background-light/10"></div>
          </div>
        </div>

        

        <!-- Business Information Header (Seller only) -->
        <br></br>
        <div v-if="role==='seller'" class="mb-6">
          <button
            type="button"
            @click="showSingPassModal = true"
            class="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
            <span>🇸🇬 Verify with SingPass</span>
          </button>
          
          <div v-if="isSingPassVerified" class="mt-2 p-3 bg-green-50 rounded-lg">
            <p class="text-sm text-green-800">
              ✓ Verified: {{ verifiedBusinessData.businessName }}
            </p>
          </div>
        </div>

        <!-- FORM -->
        <form class="mt-5 space-y-4" @submit.prevent="onSubmit" novalidate>
          <!-- Business Fields (Seller only) -->
          <div v-if="role==='seller'" class="space-y-3">
            <div>
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-200">NRIC/FIN</label>
                <span class="text-xs text-gray-500">{{ nric.length }}/9</span>
              </div>
              <input v-model.trim="nric" maxlength="9"
                     class="w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                            dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                     :class="invalid(nricValid) ? 'border-red-400' : ''" 
                     placeholder="e.g., S1234567A" />
              <p v-if="invalid(nricValid)" class="text-xs text-red-500 mt-1">Please enter a valid NRIC/FIN</p>
            </div>

            <div>
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Registered Company Name</label>
                <span class="text-xs text-gray-500">{{ companyName.length }}/100</span>
              </div>
              <input v-model.trim="companyName" maxlength="100"
                     class="w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                            dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                     :class="invalid(companyNameValid) ? 'border-red-400' : ''" placeholder="Company Name" />
            </div>

            <div>
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Business License Number/UEN</label>
                <span class="text-xs text-gray-500">{{ uen.length }}/20</span>
              </div>
              <input
                v-model.trim="uen"
                maxlength="20"
                :class="[
                  'w-full rounded-lg px-4 py-3',
                  'bg-gray-50 text-gray-900 placeholder-gray-400',
                  'dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400',
                  invalid(uenValid) ? 'border border-red-400 dark:border-red-500'
                                    : 'border border-gray-200 dark:border-gray-700'
                ]"
                placeholder="UEN"
              />
            </div>

            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Registered Company Address</label>
              <input v-model.trim="postalCode" inputmode="numeric" maxlength="6"
                     class="mt-1 w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                            dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                     :class="invalid(postalValid) ? 'border-red-400' : ''" placeholder="Postal Code (e.g. 123456)" />
              <input v-model.trim="addressLine"
                     class="mt-2 w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                            dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                     :class="invalid(addressLineValid) ? 'border-red-400' : ''"
                     placeholder="Address (e.g., BLK 123A GREENLAND DRIVE 10)" />
              <input v-model.trim="unitNo"
                     class="mt-2 w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                            dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                     placeholder="Unit No (e.g. #10-234)" />
            </div>

            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Business License Document</label>
              <div class="mt-1">
                <label class="inline-flex items-center gap-2 rounded-lg border px-4 py-2 cursor-pointer
                               bg-white border-gray-200 hover:bg-gray-50
                               dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                       :class="{ 'opacity-50 cursor-not-allowed': loading }">
                  <input type="file" class="hidden" @change="onUpload" accept=".pdf,.jpg,.jpeg,.png" :disabled="loading" />
                  <svg class="h-4 w-4 text-[#10A9C7]" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                  <span>Upload</span>
                </label>
                <span v-if="licenseFileName" class="ml-2 text-sm text-gray-600 dark:text-gray-300">{{ licenseFileName }}</span>
              </div>
              <!-- Upload Progress Bar -->
              <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-2">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-[#10A9C7] transition-all duration-300" :style="{ width: uploadProgress + '%' }"></div>
                  </div>
                  <span class="text-xs text-gray-600 dark:text-gray-400">{{ uploadProgress }}%</span>
                </div>
              </div>
              <p v-if="invalid(licenseValid)" class="text-xs text-red-500 mt-1">Please upload your BizFile+ / license</p>
              <p v-if="uploadError" class="text-xs text-red-500 mt-1">{{ uploadError }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF, JPG, or PNG. Max 5MB.</p>
            </div>

            <!-- Terms and Conditions -->
            <div class="mt-4">
              <label class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" v-model="termsAccepted" class="mt-0.5 cursor-pointer">
                <span>
                  I have read and agree to the 
                  <button 
                    type="button"
                    @click="showTermsModal = true" 
                    class="text-[#10A9C7] hover:underline font-medium">
                    Terms & Conditions
                  </button>.
                </span>
              </label>
              <p v-if="invalid(termsValid)" class="text-xs text-red-500 mt-1">You must agree to the Terms & Conditions</p>
            </div>

            <!-- Terms Modal -->
            <Teleport to="body">
              <div v-if="showTermsModal" 
                  class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                  @click="showTermsModal = false">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col"
                    @click.stop>
                  <!-- Header -->
                  <div class="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Verified Seller Terms & Conditions</h3>
                    <button @click="showTermsModal = false" 
                            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none">
                      ×
                    </button>
                  </div>
                  
                  <!-- Scrollable Content -->
                  <div class="overflow-y-auto flex-1 px-6 py-6">
                    <div class="prose dark:prose-invert max-w-none text-sm">
                      <p class="text-gray-500 dark:text-gray-400 mb-6">
                        <strong>Last Updated:</strong> November 2025
                      </p>
                      
                      <p class="mb-6">
                        By checking the box below and registering as a Verified Seller on HouseBiBi, you acknowledge that you have read, understood, and agree to comply with the following terms and conditions:
                      </p>

                      <h2 class="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">1. Seller Account and Verification</h2>
                      <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>You must provide accurate, current, and complete information during the registration process.</li>
                        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                        <li>You must be at least 18 years old or the age of majority in your jurisdiction to become a Verified Seller.</li>
                        <li>Your seller account may be subject to verification checks at any time to ensure compliance with these terms.</li>
                      </ul>

                      <h2 class="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">2. Product Listings and Content</h2>
                      <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        <li><strong>Authenticity:</strong> All products listed must be genuine, authentic, and accurately described.</li>
                        <li><strong>Ownership:</strong> You must have legal rights to sell all products listed on the platform.</li>
                        <li><strong>Prohibited Items:</strong> You may not list counterfeit goods, illegal items, stolen property, or items that violate intellectual property rights.</li>
                      </ul>

                      <h2 class="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">3. Photo and Image Upload Policy</h2>
                      <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        <li><strong>Original Content:</strong> All product photos and images must be your own original work or properly licensed content that you have permission to use.</li>
                        <li><strong>Prohibited Content:</strong> You must NOT upload:
                          <ul class="list-circle pl-5 mt-2 space-y-1">
                            <li>Copyrighted images from other websites, brands, or sellers without permission</li>
                            <li>Watermarked images belonging to others</li>
                            <li>Stock photos misrepresenting the actual product</li>
                            <li>Images containing inappropriate, offensive, or illegal content</li>
                            <li>Photos of products you do not actually possess or have in stock</li>
                            <li>Images depicting minors in inappropriate contexts</li>
                            <li>Misleading or deceptive imagery</li>
                          </ul>
                        </li>
                        <li><strong>Abuse Prevention:</strong> Any systematic or repeated uploading of unauthorized images, stolen content, or misrepresentative photos will result in immediate account suspension and potential legal action.</li>
                        <li><strong>Image Verification:</strong> We reserve the right to request proof of ownership or licensing for any images uploaded to the platform.</li>
                      </ul>

                      <h2 class="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">4. AI-Generated Content Policy</h2>
                      
                      <h3 class="text-base font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">4.1 Disclosure Requirements:</h3>
                      <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>AI-generated product images, descriptions, or content must be clearly disclosed</li>
                        <li>You must explicitly label AI-generated images with tags like "[AI-Generated]" or similar indicators</li>
                        <li>Misleading buyers about the authenticity of product representations is strictly prohibited</li>
                      </ul>

                      <h3 class="text-base font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">4.2 AI Content Standards:</h3>
                      <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>AI-generated images must accurately represent the actual product being sold</li>
                        <li>You may not use AI to create fake reviews, testimonials, or social proof</li>
                        <li>AI-generated product descriptions must be factually accurate and not misleading</li>
                        <li>Deepfakes, manipulated images of real people, or AI content that violates privacy rights are strictly forbidden</li>
                      </ul>

                      <h3 class="text-base font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">4.3 Prohibited AI Uses:</h3>
                      <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Creating fake product variations or options that don't exist</li>
                        <li>Generating false certifications, badges, or quality marks</li>
                        <li>Producing misleading comparison images with competitors</li>
                        <li>Manufacturing fake customer photos or unboxing content</li>
                        <li>Creating deceptive "before and after" imagery</li>
                      </ul>

                      <h2 class="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">5. Intellectual Property Rights</h2>
                      <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>You represent that all content you upload does not infringe upon any third party's intellectual property rights.</li>
                        <li>You grant HouseBiBi a non-exclusive, worldwide license to display, reproduce, and distribute your content for platform operations.</li>
                        <li>You agree to indemnify HouseBiBi against any claims arising from your violation of intellectual property rights.</li>
                      </ul>

                      <h2 class="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">6. Prohibited Activities</h2>
                      <p class="mb-2 text-gray-700 dark:text-gray-300">You must NOT:</p>
                      <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Manipulate reviews or ratings</li>
                        <li>Engage in price fixing or anti-competitive practices</li>
                        <li>Use bots, scripts, or automated tools to gain unfair advantages</li>
                        <li>Create multiple accounts to circumvent restrictions</li>
                        <li>Harass, threaten, or abuse buyers or other sellers</li>
                        <li>Engage in fraudulent activities or scams</li>
                      </ul>

                      <h2 class="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">7. Order Fulfillment and Customer Service</h2>
                      <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>You must ship products within the timeframe specified in your listing.</li>
                        <li>You are responsible for providing accurate tracking information.</li>
                        <li>You must respond to customer inquiries within 24-48 hours.</li>
                        <li>You must honor your return and refund policies as stated in your listings.</li>
                      </ul>

                      <h2 class="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">8. Content Monitoring and Enforcement</h2>
                      <p class="mb-2 text-gray-700 dark:text-gray-300">HouseBiBi reserves the right to:</p>
                      <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Monitor, review, and remove any content that violates these terms</li>
                        <li>Use automated systems, AI, and manual review to detect policy violations</li>
                        <li>Suspend or terminate accounts without prior notice for serious violations</li>
                        <li>Report illegal activities to appropriate authorities</li>
                      </ul>

                      <p class="mt-4 mb-2 text-gray-700 dark:text-gray-300"><strong>Penalties for Violations:</strong></p>
                      <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        <li><strong>First offense:</strong> Warning and content removal</li>
                        <li><strong>Second offense:</strong> Temporary account suspension (7-30 days)</li>
                        <li><strong>Third offense or severe violations:</strong> Permanent account termination</li>
                        <li><strong>Fraudulent activity:</strong> Immediate termination and potential legal action</li>
                      </ul>

                      <h2 class="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">9. Liability and Indemnification</h2>
                      <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>You are solely responsible for your products, listings, and transactions.</li>
                        <li>You agree to indemnify and hold HouseBiBi harmless from any claims, damages, or expenses arising from your breach of these terms.</li>
                        <li>HouseBiBi is not liable for disputes between you and buyers, though we may facilitate resolution.</li>
                      </ul>

                      <h2 class="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">10. Termination</h2>
                      <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Either party may terminate this agreement with 30 days' written notice.</li>
                        <li>HouseBiBi may immediately suspend or terminate your account for material breach, fraudulent activities, repeated violations, or failure to maintain acceptable performance metrics.</li>
                        <li>Upon termination, you remain liable for all pending orders and obligations.</li>
                      </ul>

                      <h2 class="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">11. Acknowledgment</h2>
                      <p class="text-gray-700 dark:text-gray-300">By checking the agreement box, you acknowledge that:</p>
                      <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 mt-2">
                        <li>You have read and understood these Terms and Conditions</li>
                        <li>You agree to comply with all policies regarding photo uploads and AI-generated content</li>
                        <li>You understand that violations may result in account suspension or termination</li>
                        <li>You accept full responsibility for all content and activities on your seller account</li>
                        <li>You will conduct business ethically and in compliance with all applicable laws</li>
                      </ul>
                    </div>
                  </div>
                  
                  <!-- Footer -->
                  <div class="sticky bottom-0 flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-2xl">
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      Version 1.0 | <a href="mailto:seller-support@housebibi.com" class="text-[#10A9C7] hover:underline">Contact Support</a>
                    </p>
                    <button @click="handleAcceptTerms"
                            class="px-6 py-2.5 bg-[#10A9C7] hover:bg-[#0E97B3] text-white font-semibold rounded-lg transition">
                      I Agree
                    </button>
                  </div>
                </div>
              </div>
            </Teleport>
          </div>

          <!-- Account Details Section Header -->
          <div :class="role==='seller' ? 'mt-6' : ''">
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Account Details</p>
          </div>

          <!-- Account details (everyone) -->
          <div class="space-y-3">
            <div>
              <input v-model.trim="username" type="text"
                     class="w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                            dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                     placeholder="Username" autocomplete="username" />
              <p v-if="username && !usernameValid" class="text-xs text-red-500 mt-1">
                Username must be 8–20 alphanumeric characters
              </p>
            </div>

            <div>
              <input v-model.trim="email" type="email"
                     class="w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                            dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                     placeholder="Email" autocomplete="email" />
              <p v-if="email && !emailValid" class="text-xs text-red-500 mt-1">Please enter a valid email</p>
            </div>

            <div>
              <div class="relative">
                <input :type="showPassword ? 'text' : 'password'" v-model="password"
                       class="w-full rounded-lg px-4 py-3 pr-10 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                              dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                       placeholder="Password" autocomplete="new-password" />
                <button type="button" @click="showPassword=!showPassword"
                        class="absolute inset-y-0 right-3 grid place-items-center text-gray-500 dark:text-gray-300 hover:opacity-80 focus:outline-none">
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 013.563-4.773M6.223 6.223A9.965 9.965 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.953 9.953 0 01-4.152 5.016M6.223 6.223L3 3m3.223 3.223L21 21"/>
                  </svg>
                </button>
              </div>
              <p v-if="password && !passwordStrong" class="text-xs text-red-500 mt-1">
                Password must have 8+ chars, one upper, one lower, and a symbol
              </p>
            </div>

            <div>
              <input v-model.trim="displayName" type="text"
                     class="w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                            dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                     placeholder="Display Name" autocomplete="name" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
  v-model="gender"
  class="w-full rounded-lg px-4 py-3 pr-10 border bg-gray-50 border-gray-200 text-gray-700 text-sm sm:text-base
         appearance-none relative
         dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
  style="background-image: linear-gradient(45deg, transparent 50%, gray 50%), linear-gradient(135deg, gray 50%, transparent 50%);
         background-position: right 1rem center, right 0.75rem center;
         background-size: 6px 6px, 6px 6px;
         background-repeat: no-repeat;">
  <option value="" disabled selected class="text-sm sm:text-base">Gender</option>
  <option value="Female" class="text-sm sm:text-base">Female</option>
  <option value="Male" class="text-sm sm:text-base">Male</option>
  <option value="Prefer not to say" class="text-sm sm:text-base">Prefer not to say</option>
</select>




              <div class="relative">
                <input v-model="birthday" type="date"
                       class="w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-sm sm:text-base
                              dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100
                              date-input" 
                       placeholder="Birthday" />
                <p v-if="birthday && !birthdayValid" class="text-xs text-red-500 mt-1">You must be at least 18</p>
              </div>
            </div>

            <div>
              <input v-model.trim="phone" type="tel" inputmode="tel"
                     class="w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                            dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                     placeholder="SG Phone Number" />
              <p v-if="phone && !phoneValid" class="text-xs text-red-500 mt-1">
                Use 8 digits starting with 8 or 9, or +65 8/9xxxxxxx
              </p>
            </div>

            <!-- reCAPTCHA -->
            <div class="mt-2">
              <div class="flex justify-center"><div :id="recaptchaContainerId" :key="recaptchaKey" class="inline-block"></div></div>
              <p v-if="captchaError" class="text-xs text-red-500 mt-1 text-center">Please complete the reCAPTCHA.</p>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button type="submit" :disabled="!canSubmit || loading"
                      class="w-full rounded-lg bg-[#FF7A5C] px-5 py-2.5 text-white font-semibold
                             hover:opacity-95 disabled:bg-gray-300 disabled:cursor-not-allowed">
                <span v-if="!loading">Sign up</span><span v-else>Creating account…</span>
              </button>
            </div>

            <p class="text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?
              <router-link to="/login" class="text-[#10A9C7] hover:underline">Log in</router-link>
            </p>

            <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>
          </div>
        </form>
      </div>
    </div>
  <SingPassVerificationModal 
      :show="showSingPassModal"
      @close="showSingPassModal = false"
      @verified="handleSingPassVerified"
    />
  <OnboardingModal
  v-if="showOnboardingModal"
  :verifiedData="verifiedData"
  @close="showOnboardingModal = false"
  />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { registerUserWithUsername } from '../firebase/auth/authService'
import { markBusinessAsRegistered, verifySingPass } from '@/firebase/services/singpassVerification.js'
import { auth, db } from '../firebase/firebase_config'
import { user } from '@/store/user.js'
import { useRoute } from 'vue-router'
import SingPassVerificationModal from '@/components/SingPassVerificationModal.vue'
import { loginWithGooglePopup } from '@/firebase/auth/authService'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import googleLogo from '@/assets/google-logo.png'
import { useToast } from '@/composables/useToast'
const { success, error:toastError } = useToast()

const route = useRoute()
const router = useRouter()
const loadingGoogle = ref(false)

// SingPass verification
const showSingPassModal = ref(false)
const verifiedBusinessData = ref(null)
const isSingPassVerified = ref(false)
const showOnboardingModal = ref(false)
const verifiedData = ref(null)

// Handle successful SingPass verification
function handleSingPassVerified(data) {
  console.log('✅ SingPass verified:', data)
  verifiedBusinessData.value = data
  isSingPassVerified.value = true
  
  // Pre-fill form fields with verified data
  nric.value = data.nric
  displayName.value = data.fullName
  birthday.value = data.dateOfBirth
  gender.value = data.gender
  phone.value = data.phone
  companyName.value = data.businessName
  uen.value = data.uen
  postalCode.value = data.businessAddress.postalCode
  addressLine.value = data.businessAddress.addressLine
  unitNo.value = data.businessAddress.unitNo || ''
  
  // Show success message
  success('✅ Your business details have been verified and pre-filled!')
}

const showTermsModal = ref(false)

function handleAcceptTerms() {
  termsAccepted.value = true
  showTermsModal.value = false
}
/* Role */
const role = ref('buyer')
function setRole(v){ role.value = v }

/* Business fields (Seller only) */
const nric = ref('')
const companyName = ref('')
const uen = ref('')
const postalCode = ref('')
const addressLine = ref('')
const unitNo = ref('')
const licenseFile = ref(null)
const licenseFileName = ref('')
const termsAccepted = ref(false)
const triedSubmit = ref(false)
const uploadProgress = ref(0)
const uploadError = ref('')

function onUpload(e){ 
  const f = e.target.files?.[0]
  licenseFile.value = f || null
  licenseFileName.value = f?.name || ''
  uploadError.value = ''
  uploadProgress.value = 0
  
  // Validate file type
  if (f) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(f.type)) {
      uploadError.value = 'Please upload a PDF, JPG, or PNG file.'
      licenseFile.value = null
      licenseFileName.value = ''
      return
    }
    
    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (f.size > maxSize) {
      uploadError.value = 'File is too large. Maximum size is 5MB.'
      licenseFile.value = null
      licenseFileName.value = ''
      return
    }
  }
}

/* Account fields */
const username = ref('')
const email = ref('')
const password = ref('')
const displayName = ref('')
const gender = ref('')
const birthday = ref('')
const phone = ref('')

/* UI */
const showPassword = ref(false)
const loading = ref(false)
const loadingMessage = ref('Creating your account...')
const errorMsg = ref('')

/* Validations */
const usernameValid = computed(()=>/^[A-Za-z0-9]{8,20}$/.test(username.value.trim()))
const emailValid = computed(()=>/\S+@\S+\.\S+/.test(email.value))
const passwordStrong = computed(()=>/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/.test(password.value))
const phoneValid = computed(()=>{ const v=phone.value.trim(); if(!v) return true; return /^(?:\+65\s*)?[89]\d{7}$/.test(v) })
const birthdayValid = computed(()=>{ if(!birthday.value) return true; const b=new Date(birthday.value), t=new Date(); let a=t.getFullYear()-b.getFullYear(); const before=t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()); if(before) a--; return a>=18 })

const companyNameValid = computed(()=>companyName.value.trim().length>0 && companyName.value.trim().length<=100)
const nricValid = computed(() => {
  const val = nric.value.trim().toUpperCase()
  // Singapore NRIC/FIN format: Letter + 7 digits + Letter
  // Valid starting letters: S, T, F, G, M
  return /^[STFGM]\d{7}[A-Z]$/.test(val)
})
const uenValid = computed(() => uen.value.trim().length > 0)
const postalValid = computed(()=>/^\d{6}$/.test(postalCode.value.trim()))
const addressLineValid = computed(()=>addressLine.value.trim().length>0)
const licenseValid = computed(()=>!!licenseFile.value)
const termsValid = computed(()=>termsAccepted.value===true)
const invalid = (rule)=> triedSubmit.value && !rule

/* Business validation gate */
const businessOk = computed(()=>{
  if(role.value !== 'seller') return true
  return nricValid.value && companyNameValid.value && uenValid.value && postalValid.value && addressLineValid.value && licenseValid.value && termsValid.value
})

/* reCAPTCHA */
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
const captchaToken = ref('')
const captchaError = ref(false)
const recaptchaKey = ref(0) // Used to force re-render
const recaptchaContainerId = ref('recaptcha-container-0')
let widgetId = null
let themeObserver

function currentTheme () {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function resetRecaptcha() {
  if (window.grecaptcha && widgetId !== null) {
    window.grecaptcha.reset(widgetId)
  }
  captchaToken.value = ''
}

function recreateRecaptcha() {
  // Increment key to force Vue to destroy and recreate the container
  recaptchaKey.value++
  recaptchaContainerId.value = `recaptcha-container-${recaptchaKey.value}`
  widgetId = null
  captchaToken.value = ''
  captchaError.value = false
  
  // Wait for Vue to create the new DOM element
  setTimeout(() => {
    if (document.getElementById(recaptchaContainerId.value)) {
      renderRecaptcha()
    }
  }, 100)
}

function loadRecaptchaScript() {
  return new Promise((resolve, reject) => {
    if (window.grecaptcha?.render) return resolve()
    const s = document.createElement('script')
    s.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('recaptcha/script-failed'))
    document.head.appendChild(s)
  })
}

function renderRecaptcha() {
  const container = document.getElementById(recaptchaContainerId.value)
  if (!container) {
    console.error('reCAPTCHA container not found:', recaptchaContainerId.value)
    return
  }
  
  if (!window.grecaptcha || typeof window.grecaptcha.render !== 'function') {
    console.error('grecaptcha not ready')
    return
  }
  
  const theme = currentTheme()
  
  try {
    widgetId = window.grecaptcha.render(recaptchaContainerId.value, {
      sitekey: recaptchaSiteKey,
      theme,
      callback: (token) => {
        captchaToken.value = token
        captchaError.value = false
      },
      'expired-callback': () => {
        captchaToken.value = ''
        captchaError.value = true
      }
    })
  } catch (error) {
    console.error('Error rendering reCAPTCHA:', error)
  }
}
async function onGoogleSignup() {
  loadingGoogle.value = true
  errorMsg.value = ''
  
  try {
    // 1) Sign up with Google
    const result = await loginWithGooglePopup()
    const { user: u, isNewUser } = result
    
    // 2) For NEW users - save role and redirect to CompleteProfile
    if (isNewUser) {
      await setDoc(doc(db, 'users', u.uid), {
        role: role.value,
        profileComplete: false
      }, { merge: true })
      
      console.log(`✅ Google signup - Role saved: ${role.value}`)
      
      // Redirect to CompleteProfile to finish registration
      await router.push('/complete-profile')
      return
    }
    
    // 3) EXISTING user - check if profile is complete
    const userDoc = await getDoc(doc(db, 'users', u.uid))
    const userData = userDoc.data()
    
    if (userData.profileComplete === false || !userData.username) {
      // Profile incomplete - go to CompleteProfile
      await router.push('/complete-profile')
      return
    }
    
    // 4) Profile complete - redirect to appropriate home
    if (userData.role === 'seller' && userData.username) {
      await router.push({ name: 'business-home', params: { username: userData.username.toLowerCase() } })
    } else {
      await router.push('/')
    }
    
  } catch (e) {
    console.error('Google signup error:', e)
    errorMsg.value = e?.hint || e?.message || 'Google sign-up failed. Please try again.'
  } finally {
    loadingGoogle.value = false
  }
}
function validateCaptcha() {
  if (!captchaToken.value) {
    captchaError.value = true
    return false
  }
  return true
}

// If query parameter exists, override default (for users who press 'Get Started Now' on sellers' page)
onMounted(() => {
  if (route.query.role === 'seller') {
    role.value = 'seller'

    // Auto-show SingPass modal if requested
    if (route.query.showSingPass === 'true') {
      showSingPassModal.value = true
    }
  }
})

onMounted(async () => {
  if (!recaptchaSiteKey) {
    console.error('Missing VITE_RECAPTCHA_SITE_KEY in .env.local')
    return
  }
  await loadRecaptchaScript()
  renderRecaptcha()

  // Watch for dark mode changes and recreate reCAPTCHA with new container
  themeObserver = new MutationObserver(() => {
    recreateRecaptcha()
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(()=>{ themeObserver?.disconnect(); resetRecaptcha() })

/* Submit */
const canSubmit = computed(()=>(
  usernameValid.value && emailValid.value && passwordStrong.value &&
  phoneValid.value && birthdayValid.value && displayName.value.trim().length>0 &&
  businessOk.value
))

async function onSubmit(){
  triedSubmit.value = true
  if(!canSubmit.value || loading.value) return
  if(!validateCaptcha()) return

  console.log('Starting signup process...')
  loading.value = true
  user.isSigningUp = true
  errorMsg.value = ''
  uploadProgress.value = 0
  const startTime = Date.now()
  
  try{
    if (role.value === 'seller' && licenseFile.value) {
      loadingMessage.value = 'Uploading your business license...'
    } else {
      loadingMessage.value = 'Creating your account...'
    }
    
    console.log('Calling registerUserWithUsername...')
    
    // ✅ BUILD extraData FIRST
    const extraData = {
      gender: gender.value,
      birthday: birthday.value,
      phone: phone.value.trim(),
      ...(role.value === 'seller'
        ? { 
            nric: nric.value.trim().toUpperCase(),
            companyName: companyName.value.trim(), 
            uen: uen.value.trim(),
            postalCode: postalCode.value.trim(), 
            addressLine: addressLine.value.trim(),
            unitNo: unitNo.value.trim() || null,
          }
        : {}),
    }
    
    console.log('📋 Extra data being passed:', extraData)
    
    // ✅ ONLY ONE newUser DECLARATION
    const newUser = await registerUserWithUsername({
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value,
      displayName: displayName.value.trim(),
      role: role.value,
      extra: extraData,
      captchaToken: captchaToken.value,
      licenseFile: role.value === 'seller' ? licenseFile.value : null,
      onUploadProgress: (progress) => {
        uploadProgress.value = progress
        if (progress === 100) {
          loadingMessage.value = 'Finalizing your account...'
        }
      }
    })
    
    console.log('✅ Registration complete! UID:', newUser.uid)

    // Mark SingPass verification as registered
    if (role.value === 'seller' && isSingPassVerified.value && nric.value) {
      try {
        console.log('🔗 Marking SingPass verification as registered...')
        
        await markBusinessAsRegistered(nric.value, {
          email: email.value,
          username: username.value,
          uid: newUser.uid
        })
        
        console.log('✅ SingPass verification marked as registered')
      } catch (verificationError) {
        console.error('⚠️ Failed to update verification record:', verificationError)
      }
    }

    const elapsedTime = Date.now() - startTime
    const remainingTime = Math.max(0, 5000 - elapsedTime)

    loadingMessage.value = 'Account created successfully!'

    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime))
    }

    // Clear flags
    loading.value = false
    user.isSigningUp = false

    // Show success alert
    success('✅ Account created successfully!')

    // ✅ HANDLE BUYER VS SELLER DIFFERENTLY
    if (role.value === 'seller') {
      console.log('🎯 Preparing onboarding data for seller...')
      
      // ✅ STORE VERIFIED DATA FOR ONBOARDING MODAL
      user.onboardingData = {
        nric: nric.value.trim().toUpperCase(),
        name: companyName.value.trim(),
        uen: uen.value.trim(),
        address: `${unitNo.value.trim() ? unitNo.value.trim() + ', ' : ''}${addressLine.value.trim()}, ${postalCode.value.trim()}`,
        phone: phone.value.trim(),
        email: email.value.trim(),
        username: username.value.trim(),
        uid: newUser.uid
      }
      
      console.log('📦 Onboarding data stored:', user.onboardingData)
      
      // Set the flag that App.vue watches
      user.needsOnboarding = true
      console.log('✅ needsOnboarding set to:', user.needsOnboarding)
      
      // Small delay to ensure auth state is fully settled
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Navigate home where modal will show
      router.push('/')
    } else {
      // ✅ BUYER SIGNUP - HARD RELOAD
      console.log('👤 Buyer signup complete - performing hard reload...')
      
      // Small delay to ensure everything is saved
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Navigate to home first
      await router.push('/')
      
      // Then perform hard reload to refresh auth state and preferences
      window.location.reload()
    }
    
  }catch(err){
    console.error('❌ Signup error:', err)
    errorMsg.value = mapError(err)
    uploadProgress.value = 0
    loading.value = false
    user.isSigningUp = false
    loadingMessage.value = 'Creating your account...'
    resetRecaptcha()
  }
}



function mapError(err){
  const code = err?.code || err?.message || ''
  if (code.includes('username-already-in-use')) return 'Username has been taken.'
  if (code.includes('invalid-username')) return 'Username must be 8–20 alphanumeric characters.'
  if (code.includes('email-already-in-use')) return 'This email is already registered.'
  if (code.includes('invalid-email')) return 'Please enter a valid email.'
  if (code.includes('weak-password')) return 'Password must be stronger.'
  if (code.includes('captcha')) return 'Please complete the reCAPTCHA.'
  if (code.includes('upload/invalid-file-type')) return 'Please upload a PDF, JPG, or PNG file.'
  if (code.includes('upload/file-too-large')) return 'File is too large. Maximum size is 5MB.'
  if (code.includes('upload/failed')) return 'File upload failed. Please try again.'
  return 'Something went wrong. Please try again.'
}
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Fix date input calendar icon visibility in dark mode */
.date-input::-webkit-calendar-picker-indicator {
  filter: invert(0);
  cursor: pointer;
}

.dark .date-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

/* Style date input for better mobile UX */
input[type="date"] {
  position: relative;
}

input[type="date"]::-webkit-datetime-edit {
  padding: 0;
}
</style>