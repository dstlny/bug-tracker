<template>

  <GenericDetailPage
    :needExtraActions="true"
    :needSubContent="selectedBugID !== null"
    :needSubContentActions="selectedBugID !== null"
  >

    <template v-slot:actions-label>
      Update Details

      <span
        class="float-right"
      >
        <q-badge
          v-if="project"
          class="text-subtitle1 cursor-pointer"
          :color="getStatusColour(project.status)"
          @click="flipStatus(project)"
        >
          {{ project.status }}
        </q-badge>
      </span>

      <span
        class="float-right"
        style="margin-right: 5px"
      >
        <q-badge
          v-if="project"
          class="text-subtitle1 cursor-pointer"
          :color="getPriorityColour(project.priority)"
          @click="flipPriority(project)"
        >
          {{ project.priority }}
        </q-badge>
      </span>
    </template>

    <template v-slot:actions-section>

      <q-form
        ref="projectUpdateForm"
        @submit="onProjectSubmit"
      >
        <q-input
          outlined
          dense
          options-dense
          v-model="projectName"
          label="Name"
          required

          :disable="!userStore.isAuthenticated"
        />

        <q-select
          outlined
          dense
          options-dense
          v-model="projectStatus"
          :options="statuses"
          label="Status"
          style="margin-top: 10px"
          required

          :disable="!userStore.isAuthenticated"
        />

        <q-select
          outlined
          dense
          options-dense
          v-model="projectPriority"
          :options="priorities"
          label="Priority"
          style="margin-top: 10px"
          required

          :disable="!userStore.isAuthenticated"
        />

        <q-select
          outlined
          multiple
          options-dense
          dense
          v-model="projectBadges"
          :options="allBadges"
          option-value="id"
          option-label="label"
          label="Badges"
          style="margin-top: 10px"
          required
          use-chips
          :disable="!userStore.isAuthenticated"
        >
          <template v-slot:selected-item="scope">
            <q-chip
              removable
              square
              dense
              size="md"
              class="q-ma-xs"
              @remove="scope.removeAtIndex(scope.index)"
              :tabindex="scope.tabindex"
              :color="scope.opt.color"
            >
              {{ scope.opt.label }}
            </q-chip>
          </template>
        </q-select>

        <q-select
          outlined
          dense
          options-dense
          v-model="projectClient"
          :options="projectClients"
          option-value="id"
          option-label="name"
          label="Client"
          style="margin-top: 10px"
          required

          :disable="!userStore.isAuthenticated"
        >
          <template v-slot:after>
            <q-btn
              round
              dense
              flat
              icon="launch"
              :to="{
                name: 'clientDetail',
                params: {
                  clientId: projectClient?.id
                }
              }"
            />
          </template>
        </q-select>

        <div>
          <q-btn
            label="Update"
            type="submit"
            color="primary"
            class="full-width"
            style="margin-top: 10px"
            dense

            :disable="!userStore.isAuthenticated"
          />
        </div>

      </q-form>

    </template>

    <template v-slot:extra-actions>

      <q-uploader
        v-if="project"

        flat
        bordered
        dense

        with-credentials
        field-name="document_to_upload"
        accept=".jpg, image/*, doc/*"
        auto-upload
        no-thumbnails
        :disable="!userStore.isAuthenticated"
        label="Upload document"

        :url="createDocumentUploadURL('Project', project.id)"

        @uploaded="!userStore.isAuthenticated ? uploadedDocument : void 0"
        style="width: 100%"
      />

      <q-btn
        label="Add bug"
        color="primary"
        class="full-width"
        style="margin-top: 10px"
        dense
        :disable="!userStore.isAuthenticated"

        @click="addBug = true"
      />

      <q-btn
        label="Add badge"
        color="primary"
        class="full-width"
        style="margin-top: 10px"
        dense
        :disable="!userStore.isAuthenticated"
        @click="setBadgeTarget(project)"
      />

      <AuthenticatedDialog
        v-model="addBug"
      >
        <template
          v-slot:content
        >
          <q-form
            ref="addBugForm"
            @submit="onBugSubmit"
          >

            <q-input
              outlined
              dense
              v-model="bugContent"
              label="Description"
              required
            />

            <q-select
              outlined
              dense
              options-dense
              v-model="bugStatus"
              :options="statuses"
              label="Status"
              style="margin-top: 10px"
              required
            />

            <q-select
              outlined
              dense
              options-dense
              v-model="bugPriority"
              :options="priorities"
              label="Priority"
              style="margin-top: 10px"
              required
            />

            <q-select
              outlined
              dense
              options-dense
              multiple
              v-model="bugAllocatedUsers"
              :options="userStore.allUsers"
              label="Allocate to"
              style="margin-top: 10px"
              option-value="id"
              option-label="username"
              required
              use-chips
            />

            <div>
              <q-btn
                label="Create Bug"
                type="submit"
                color="primary"
                class="full-width"
                style="margin-top: 10px"
                dense
              />

              <q-btn
                flat
                label="Cancel"
                class="full-width"
                style="margin-top: 10px"
                dense
                v-close-popup
              />
            </div>

          </q-form>
        </template>
      </AuthenticatedDialog>

      <q-btn
        label="Add comment"
        color="primary"
        class="full-width"
        style="margin-top: 10px"
        dense
        :disable="!userStore.isAuthenticated"

        @click="addComment = true"
      />

      <AuthenticatedDialog
        v-model="addComment"
      >
        <template
          v-slot:content
        >
          <q-form
            ref="addCommentForm"
            @submit="onCommentSubmit"
          >

            <q-select
              outlined
              dense
              options-dense
              v-model="commentBug"
              :options="project.bugs"
              option-value="id"
              option-label="content"
              label="Bug"
            />

            <q-input
              outlined
              dense
              v-model="commentDescription"
              label="Comment"
              style="margin-top: 10px"
              required
            />

            <div>
              <q-btn
                label="Create Comment"
                type="submit"
                color="primary"
                class="full-width"
                style="margin-top: 10px"
                dense
              />

              <q-btn
                flat
                label="Cancel"
                class="full-width"
                style="margin-top: 10px"
                dense
                v-close-popup
              />
            </div>

          </q-form>
        </template>
      </AuthenticatedDialog>

      <q-btn
        label="Add thread"
        color="primary"
        class="full-width"
        style="margin-top: 10px"
        dense
        :disable="!userStore.isAuthenticated"

        @click="addThread = true"
      />

      <AuthenticatedDialog
        v-model="addThread"
      >
        <template
          v-slot:content
        >
          <q-form
            ref="addThreadForm"
            @submit="onThreadSubmit"
          >

            <q-select
              outlined
              dense
              options-dense
              v-model="threadBug"
              :options="project.bugs"
              option-value="id"
              option-label="content"
              label="Bug"
              clearable
            />

            <q-input
              outlined
              dense
              v-model="threadTitle"
              label="Title"
              style="margin-top: 10px"
              required
            />

            <div>
              <q-btn
                :label="threadBug ? 'Create bug thread' : 'Create project thread'"
                type="submit"
                color="primary"
                class="full-width"
                style="margin-top: 10px"
                dense
              />

              <q-btn
                flat
                label="Cancel"
                class="full-width"
                style="margin-top: 10px"
                dense
                v-close-popup
              />
            </div>

          </q-form>
        </template>
      </AuthenticatedDialog>

      <q-btn-group
        spread
        style="margin-top: 10px; margin-bottom: 10px"
      >
        <q-btn
          label="Add thread reply"
          color="primary"
          dense
          :disable="!userStore.isAuthenticated || selectedThreadID === null"

          @click="addThreadReply = true"
        />
        <q-btn
          color="red"
          dense
          icon="close"
          :disable="!userStore.isAuthenticated || selectedThreadID === null"

          @click="onSelectedThread(null)"
        />
      </q-btn-group>

      <AuthenticatedDialog
        v-model="addThreadReply"
      >
        <template
          v-slot:content
        >
          <q-form
            ref="addThreadReplyForm"
            @submit="onThreadReplySubmit"
          >

            <q-input
              outlined
              dense
              v-model="threadReplyContent"
              label="Comment"
              style="margin-top: 10px"
              required
            />

            <div>
              <q-btn
                label="Post reply"
                type="submit"
                color="primary"
                class="full-width"
                style="margin-top: 10px"
                dense
              />

              <q-btn
                flat
                label="Cancel"
                class="full-width"
                style="margin-top: 10px"
                dense
                v-close-popup
              />
            </div>

          </q-form>
        </template>
      </AuthenticatedDialog>

      <q-inner-loading
        :showing="isLoadingProject"
      >
        <q-spinner-gears
          size="50px"
          color="primary"
        />
      </q-inner-loading>

    </template>

    <template v-slot:main-content>

      <AuthenticatedDialog
        v-model="addBadge"
      >
        <template
          v-slot:content
        >
          <q-form
            ref="addBadgeForm"
            @submit="onSubmitBadge"
          >

            Example:
            <q-badge
              class="text-subtitle1 cursor-pointer"
              :color="addBadgeColor"
              :label="addBadgeLabel || 'test'"
            />

            <q-input
              outlined
              dense
              v-model="addBadgeLabel"
              label="Label"
              style="margin-top: 10px"
              required

              :disable="!userStore.isAuthenticated"
            />

            <q-select
              outlined
              dense
              options-dense
              v-model="addBadgeColor"
              :options="colors"
              :option-label="colorLabel"
              label="Color"
              style="margin-top: 10px"
              required

              :disable="!userStore.isAuthenticated"
            />

            <div>
              <q-btn
                label="Create badge"
                type="submit"
                color="primary"
                class="full-width"
                style="margin-top: 10px"
                dense
              />

              <q-btn
                flat
                label="Cancel"
                class="full-width"
                style="margin-top: 10px"
                dense
                v-close-popup
              />
            </div>

          </q-form>
        </template>
      </AuthenticatedDialog>

      <q-tabs
        v-model="currentTab"
        dense
        :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-grey-2 text-black'"
        align="justify"
      >
        <q-tab
          name="bugs"
          label="Project Bugs"
        />
        <q-tab
          name="threads"
          label="Project Threads"
        />
        <q-tab
          name="comments"
          label="Project Comments"
        />
        <q-tab
          name="documents"
          label="Project Documents"
        />
        <q-tab
          name="audit-trails"
          label="Project Audit Trails"
        />
      </q-tabs>

      <q-tab-panels
        v-model="currentTab"
        animated
      >
        <q-tab-panel
          name="bugs"
          v-if="project"
        >
          <TableComponent
            rowKey="id"
            rowPerPageLabel="Bugs per page: "
            :showTop="false"
            :exportFileName="'project_' +  project.id + '_bugs_.csv'"
            :rows="project.bugs"
            :columns="[
              {
                name: 'no',
                align: 'left',
                label: '#',
                field: 'id',
                sortable: false
              },
              {
                name: 'content',
                align: 'left',
                label: 'Description',
                field: 'content',
                sortable: false
              },
              {
                name: 'owner',
                align: 'left',
                label: 'Owner',
                field: row => row.owner.username,
                sortable: false
              },
              {
                name: 'allocated',
                align: 'left',
                label: 'Allocated',
                field: row => row.allocated_to.map(allocated => allocated.username).join(', ') || row.owner.username,
                sortable: false
              },
              {
                name: 'status',
                align: 'left',
                label: 'Status',
                field: 'status',
                sortable: false
              },
              {
                name: 'priority',
                align: 'left',
                label: 'Priority',
                field: 'priority',
                sortable: false
              },
              {
                name: 'created',
                align: 'left',
                label: 'Date Posted',
                field: row => row.date_created?.toLocaleString(),
                sortable: false
              }
            ]"
            :pagination="{ rowsPerPage: 10 }"
            :hasRowSelected="selectedBugID !== null"

            @row-click="onBugSelected"
            @row-deselected="onRowDeselect"

            selection="multiple"
            :selectionFilter="(item) => userStore.getUser.equals(item.owner)"
            @selected="selectedBugs"
          />
        </q-tab-panel>

        <q-tab-panel
          name="threads"
          v-if="project"
        >

          <q-list
            separator
            v-if="project.threads.length > 0"
          >
            <q-expansion-item
              group="projectThreads"

              v-for="thread of project.threads"
              :key="thread.id"

              v-model="allThreads[thread.id]"
              @show="onSelectedThread(thread.id)"
              :content-inset-level="0.5"
            >
              <template v-slot:header>
                <q-item-section>
                  <q-item-label
                    lines="1"
                  >
                    <span class="text-weight-bold">
                      {{ thread.author.username }}
                    </span>
                  </q-item-label>
                  <q-item-label>
                    {{ thread.content }}
                  </q-item-label>
                </q-item-section>

                <q-item-section
                  side
                  top
                >
                  Thread started @
                  <span class="text-weight-bold">
                    {{ thread.date_created.toLocaleString()}}
                  </span>
                </q-item-section>
              </template>

              <q-list
                separator
                v-if="thread.replies.length > 0"
              >
                <q-item
                  v-for="comment of thread.replies"
                  :key="comment.id"
                >
                  <q-item-section>
                    <q-item-label
                      lines="1"
                    >
                      <span class="text-weight-bold">
                        {{ comment.author.username }}
                      </span>
                    </q-item-label>
                    <q-item-label>
                      {{ comment.content }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section
                    side
                    top
                  >
                    Reply posted @
                    <span class="text-weight-bold">
                      {{ comment.date_created.toLocaleString()}}
                    </span>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-list
                separator
                v-else
              >
                <q-item>
                  <q-item-section>
                    <q-item-label
                      lines="1"
                    >
                      <span class="text-weight-bold">
                        Sorry, no replies to this thread at the moment
                      </span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>

            </q-expansion-item>
          </q-list>
          <q-list
            separator
            v-else
          >
            <q-item>
              <q-item-section>
                <q-item-label
                  lines="1"
                >
                  <span class="text-weight-bold">
                    Sorry, no threads regarding this project at the moment
                  </span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>

        <q-tab-panel
          name="comments"
          v-if="project"
        >
          <TableComponent
            rowKey="id"
            rowPerPageLabel="Comments per page: "
            selection="none"
            :showTop="false"
            :exportFileName="'project_' +  project.id + '_comments_.csv'"
            :rows="project.comments"
            :columns="[
              {
                name: 'author',
                align: 'left',
                label: 'Author',
                field: row => row.author.username,
                sortable: false
              },
              {
                name: 'content',
                align: 'left',
                label: 'Description',
                field: 'content',
                sortable: false
              },
              {
                name: 'posted',
                align: 'left',
                label: 'Date Posted',
                field: row => row.date_created?.toLocaleString(),
                sortable: true,
                sort: (a, b, rowA, rowB) => sortByDate(rowA, rowB, 'date_created')
              },
            ]"
            :pagination="{
              rowsPerPage: 10,
              sortBy: 'posted',
              descending: true
            }"
          />
        </q-tab-panel>

        <q-tab-panel
          name="documents"
          v-if="project"
        >
          <TableComponent
            rowKey="id"
            rowPerPageLabel="Documents per page: "
            selection="single"
            :showTop="false"
            :exportFileName="'project_' +  project.id + '_documents_.csv'"
            :rows="project.documents"
            :selectedLabel="'DOWNLOAD'"
            :selectedIcon="'download'"
            :columns="[
              {
                name: 'original_name',
                align: 'left',
                label: 'Name',
                field: 'original_name',
                sortable: false
              }
            ]"
            :pagination="{
              rowsPerPage: 10,
              sortBy: 'original_name',
              descending: true
            }"
            @selected="download"
          />
        </q-tab-panel>

        <q-tab-panel
          name="audit-trails"
          v-if="project"
        >
          <TableComponent
            rowKey="id"
            rowPerPageLabel="Audit Trails per page: "
            selection="none"
            :showTop="false"
            :exportFileName="'project_' +  project.id + '_audit_trails.csv'"
            :rows="project.audit_trails"
            :columns="[
              {
                name: 'object_comment',
                align: 'left',
                label: 'Description',
                field: 'object_comment',
                sortable: false
              },
              {
                name: 'date_created',
                align: 'left',
                label: 'Date Recorded',
                sortable: true,
                field: row => row.date_created.toLocaleString(),
                sortable: true,
                sort: (a, b, rowA, rowB) => sortByDate(rowA, rowB, 'date_created')
              }
            ]"
            :pagination="{
              rowsPerPage: 10,
              sortBy: 'date_created',
              descending: true
            }"
          />
        </q-tab-panel>
      </q-tab-panels>

      <q-inner-loading
        :showing="isLoadingProject"
      >
        <q-spinner-gears
          size="50px"
          color="primary"
        />
      </q-inner-loading>

    </template>

    <template v-slot:sub-content>

      <q-tabs
        v-model="currentBugTab"
        dense
        :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-grey-2 text-black'"
        align="justify"
      >
        <q-tab
          name="threads"
          :label="'Bug #' + selectedBug.id + ' Threads'"
        />
        <q-tab
          name="comments"
          :label="'Bug #' + selectedBug.id + ' Comments'"
        />
        <q-tab
          name="audit-trails"
          :label="'Bug #' + selectedBug.id + ' Audit Trails'"
        />
      </q-tabs>

      <q-tab-panels
        v-model="currentBugTab"
        animated
      >

        <q-tab-panel
          name="threads"
        >

          <q-list
            separator
            v-if="selectedBug.threads.length > 0"
          >
            <q-expansion-item
              group="bugThreads"

              v-for="thread of selectedBug.threads"
              :key="thread.id"

              v-model="allThreads[thread.id]"
              @show="onSelectedThread(thread.id)"
              :content-inset-level="0.5"
            >
              <template v-slot:header>
                <q-item-section>
                  <q-item-label
                    lines="1"
                  >
                    <span class="text-weight-bold">
                      {{ thread.author.username }}
                    </span>
                  </q-item-label>
                  <q-item-label>
                    {{ thread.content }}
                  </q-item-label>
                </q-item-section>

                <q-item-section
                  side
                  top
                >
                  Thread started @
                  <span class="text-weight-bold">
                    {{ thread.date_created.toLocaleString()}}
                  </span>
                </q-item-section>
              </template>

              <q-list
                separator
                v-if="thread.replies.length > 0"
              >
                <q-item
                  v-for="comment of thread.replies"
                  :key="comment.id"
                >
                  <q-item-section>
                    <q-item-label
                      lines="1"
                    >
                      <span class="text-weight-bold">
                        {{ comment.author.username }}
                      </span>
                    </q-item-label>
                    <q-item-label>
                      {{ comment.content }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section
                    side
                    top
                  >
                    Reply posted @
                    <span class="text-weight-bold">
                      {{ comment.date_created.toLocaleString()}}
                    </span>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-list
                separator
                v-else
              >
                <q-item>
                  <q-item-section>
                    <q-item-label
                      lines="1"
                    >
                      <span class="text-weight-bold">
                        Sorry, no replies to this thread at the moment
                      </span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>

            </q-expansion-item>
          </q-list>
          <q-list
            separator
            v-else
          >
            <q-item>
              <q-item-section>
                <q-item-label
                  lines="1"
                >
                  <span class="text-weight-bold">
                    Sorry, no threads regarding this bug at the moment
                  </span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>

        <q-tab-panel
          name="comments"
        >
          <q-list
            v-if="selectedBug.comments.length > 0"
            separator
          >
            <q-item
              v-for="comment of selectedBug.comments"
              :key="comment.id"
            >
              <q-item-section>
                <q-item-label
                  lines="1"
                >
                  <span class="text-weight-bold">
                    {{ comment.author.username }}
                  </span>
                </q-item-label>
                <q-item-label>
                  {{ comment.content }}
                </q-item-label>
              </q-item-section>

              <q-item-section
                side
                top
              >
                Comment posted @
                <span class="text-weight-bold">
                  {{ comment.date_created.toLocaleString()}}
                </span>
              </q-item-section>
            </q-item>
          </q-list>
          <q-list
            separator
            v-else
          >
            <q-item>
              <q-item-section>
                <q-item-label
                  lines="1"
                >
                  <span class="text-weight-bold">
                    Sorry, no comments on this bug at the moment
                  </span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

        </q-tab-panel>

        <q-tab-panel
          name="audit-trails"
        >
          <TableComponent
            rowKey="id"
            rowPerPageLabel="Audit Trails per page: "
            selection="none"
            :showTop="false"
            :exportFileName="'project_' +  project.id + '_bug_' + selectedBug.id + '_audit_trails.csv'"
            :rows="selectedBug.audit_trails"
            :columns="[
              {
                name: 'object_comment',
                align: 'left',
                label: 'Description',
                field: 'object_comment',
                sortable: false
              },
              {
                name: 'date_created',
                align: 'left',
                label: 'Date Recorded',
                sortable: true,
                field: row => row.date_created.toLocaleString(),
                sortable: true,
                sort: (a, b, rowA, rowB) => sortByDate(rowA, rowB, 'date_created')
              }
            ]"
            :pagination="{
              rowsPerPage: 10,
              sortBy: 'date_created',
              descending: true
            }"
          />
        </q-tab-panel>
      </q-tab-panels>

      <q-inner-loading
        :showing="isLoadingProject"
      >
        <q-spinner-gears
          size="50px"
          color="primary"
        />
      </q-inner-loading>

    </template>

    <template v-slot:sub-content-actions-label>
      Update Bug #{{ selectedBugID }} Details

      <span
        class="float-right"
      >
        <q-badge
          v-if="selectedBug"
          class="text-subtitle1 cursor-pointer"
          :color="getStatusColour(selectedBug.status)"
          @click="flipStatus(selectedBug)"
        >
          {{ selectedBug.status }}
        </q-badge>
      </span>

      <span
        class="float-right"
        style="margin-right: 5px"
      >
        <q-badge
          v-if="selectedBug"
          class="text-subtitle1 cursor-pointer"
          :color="getPriorityColour(selectedBug.priority)"
          @click="flipPriority(selectedBug)"
        >
          {{ selectedBug.priority }}
        </q-badge>
      </span>

    </template>

    <template v-slot:sub-content-actions-section>

      <q-form
        ref="updateBugForm"
        @submit="onBugUpdateSubmit"
      >
        <q-input
          outlined
          dense
          v-model="updateBugContent"
          label="Description"
          type="text"
          autogrow
          required

          :disable="!userStore.isAuthenticated"
        />

        <q-select
          outlined
          dense
          options-dense
          v-model="updateBugStatus"
          :options="statuses"
          label="Status"
          style="margin-top: 10px"
          required

          :disable="!userStore.isAuthenticated"
        />

        <q-select
          outlined
          dense
          options-dense
          v-model="updateBugPriority"
          :options="priorities"
          label="Priority"
          style="margin-top: 10px"
          required

          :disable="!userStore.isAuthenticated"
        />

        <q-select
          outlined
          dense
          options-dense
          multiple
          v-model="updateBugAllocatedUsers"
          :options="userStore.allUsers"
          label="Allocate to"
          style="margin-top: 10px"
          option-value="id"
          option-label="username"
          required
          use-chips

          :disable="!userStore.isAuthenticated"
        />

        <q-select
          outlined
          multiple
          options-dense
          dense
          v-model="updateBugBadges"
          :options="allBadges"
          option-value="id"
          option-label="label"
          label="Badges"
          style="margin-top: 10px"
          required
          use-chips
          :disable="!userStore.isAuthenticated"
        >
          <template v-slot:selected-item="scope">
            <q-chip
              removable
              square
              dense
              size="md"
              class="q-ma-xs"
              @remove="scope.removeAtIndex(scope.index)"
              :tabindex="scope.tabindex"
              :color="scope.opt.color"
            >
              {{ scope.opt.label }}
            </q-chip>
          </template>
        </q-select>

        <div>
          <q-btn
            label="Update"
            type="submit"
            color="primary"
            class="full-width"
            style="margin-top: 10px"
            dense

            :disable="!userStore.isAuthenticated"
          />
        </div>

      </q-form>

      <q-btn
        label="Add badge"
        color="primary"
        class="full-width"
        style="margin-top: 10px"
        dense
        :disable="!userStore.isAuthenticated"
        @click="setBadgeTarget(selectedBug)"
      />

      <q-inner-loading
        :showing="isLoadingProject"
      >
        <q-spinner-gears
          size="50px"
          color="primary"
        />
      </q-inner-loading>

    </template>

  </GenericDetailPage>

</template>

<script>
import { defineComponent, onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore, needToBeAuthenticated } from 'stores/project'
import { useUserStore } from 'stores/user'
import Models from 'stores/objects'
import { getStatusColour, getPriorityColour, sortByDate } from 'stores/utils'
import AuthenticatedDialog from 'src/components/AuthenticatedDialog.vue'
import TableComponent from 'src/components/TableComponent.vue'
import GenericDetailPage from 'components/GenericDetailPage.vue'

export default defineComponent({

  name: 'ProjectDetailPage',

  setup () {
    const route = useRoute()
    const projectStore = useProjectStore()
    const userStore = useUserStore()

    const project = computed(() => projectStore.currentProject)
    const projectClients = computed(() => projectStore.allClients)
    const allBadges = computed(() => projectStore.allBadges)

    const isLoadingProject = ref(true)
    const projectUpdateForm = ref(null)
    const statuses = ref([
      'Open',
      'Closed'
    ])
    const priorities = ref([
      'Low',
      'Medium',
      'High'
    ])
    const colors = ref(Models.Colors)
    const projectName = ref(null)
    const projectStatus = ref(null)
    const projectPriority = ref(null)
    const projectClient = ref(null)
    const projectBadges = ref([])

    const addBug = ref(false)
    const addBugForm = ref(null)
    const bugContent = ref(null)
    const bugStatus = ref('Open')
    const bugPriority = ref('High')
    const bugAllocatedUsers = ref([])

    const updateBugForm = ref(null)
    const updateBugContent = ref(null)
    const updateBugStatus = ref('Open')
    const updateBugPriority = ref('High')
    const updateBugAllocatedUsers = ref([])
    const updateBugBadges = ref([])

    const addComment = ref(false)
    const addCommentForm = ref(null)
    const commentDescription = ref(null)
    const commentBug = ref(null)

    const addBadge = ref(false)
    const addBadgeForm = ref(null)
    const addBadgeTargetType = ref(null)
    const addBadgeTargetID = ref(null)
    const addBadgeLabel = ref(null)
    const addBadgeColor = ref(null)

    const currentTab = ref('bugs')
    const currentBugTab = ref('threads')
    const selectedBugID = ref(null)
    const selectedBug = computed(() => projectStore.currentProject.bugs.find(bug => bug.id === selectedBugID.value))

    const addThread = ref(false)
    const addThreadForm = ref(null)
    const threadTitle = ref(null)
    const threadBug = ref(null)
    const selectedThreadID = ref(null)
    const selectedThread = computed(() => selectedBug.value.threads.find(thread => thread.id === selectedThreadID.value) || project.value.threads.find(thread => thread.id === selectedThreadID.value))
    const allThreads = ref({})

    const addThreadReply = ref(false)
    const addThreadReplyForm = ref(null)
    const threadReplyContent = ref(null)

    onMounted(async () => {
      const projectId = route.params.projectId

      if (!projectStore.hasProjectWithID(projectId)) {
        await projectStore.getProjects(projectId)

        const bugsLength = project.value.bugs.length
        if (bugsLength >= 1) {
          await onBugSelected(project.value.bugs[bugsLength - 1])
        }

        isLoadingProject.value = false
        projectStatus.value = project.value.status
        projectPriority.value = project.value.priority
        projectName.value = project.value.name
        projectClient.value = project.value.client
        projectBadges.value = project.value.badges

        for (const thread of project.value.threads) {
          allThreads.value[thread.id] = false
        }

        for (const bug of project.value.bugs) {
          for (const thread of bug.threads) {
            allThreads.value[thread.id] = false
          }
        }
      }

      await Promise.allSettled([
        projectStore.getClients(),
        projectStore.getAuditTrails({
          object_id: projectId,
          object_class: 'Project'
        }),
        projectStore.getBadges(),
        userStore.getUsers()
      ])
    })

    function onProjectSubmit () {
      projectUpdateForm.value.validate().then(async (success) => {
        if (!success) {
          return
        }

        await Promise.allSettled([
          projectStore.updateProject({
            id: project.value.id,
            name: projectName.value,
            status: projectStatus.value,
            priority: projectPriority.value,
            client: projectClient.value,
            badges: projectBadges.value
          })
        ]).then(async () => {
          const promises = [
            projectStore.getAuditTrails({
              object_id: project.value.id,
              object_class: 'Project'
            })
          ]

          if (selectedBugID.value) {
            promises.push(onBugSelected(selectedBug.value))

            if (selectedThreadID.value) {
              promises.push(onSelectedThread(selectedThreadID.value))
            }
          }

          await Promise.allSettled(promises)
        })
      })
    }

    function onBugSubmit () {
      addBugForm.value.validate().then(async (success) => {
        if (!success) {
          return
        }

        await projectStore.addBug({
          content: bugContent.value,
          status: bugStatus.value,
          priority: bugPriority.value,
          allocatedUserIDS: bugAllocatedUsers.value.map(entry => entry.id)
        })

        batchChangeValues({ value: null }, bugContent, bugStatus, bugPriority)
        batchChangeValues({ value: false }, addBug)
      })
    }

    function onCommentSubmit () {
      addCommentForm.value.validate().then(async (success) => {
        if (!success) {
          return
        }

        await Promise.all([
          projectStore.addComment({
            content: commentDescription.value,
            project: project.value,
            bug: commentBug.value
          })
        ]).then(async () => {
          if (commentBug.value && selectedBugID.value && selectedBugID.value === commentBug.value.id) {
            await onBugSelected(commentBug.value)
          }

          batchChangeValues({ value: null }, commentDescription, commentBug)
          batchChangeValues({ value: false }, addComment)
        })
      })
    }

    function onSubmitBadge () {
      addBadgeForm.value.validate().then(async (success) => {
        if (!success) {
          return
        }

        await Promise.all([
          projectStore.addBadge({
            object_id: addBadgeTargetID.value,
            object_type: addBadgeTargetType.value,
            label: addBadgeLabel.value,
            color: addBadgeColor.value
          })
        ]).then(async () => {
          if (addBadgeTargetType.value === 'Bug') {
            await getBugDetails()
          } else {
            projectBadges.value = project.value.badges
            console.log(projectBadges)
          }
        })
      })
    }

    function onThreadSubmit () {
      addThreadForm.value.validate().then(async (success) => {
        if (!success) {
          return
        }

        await Promise.all([
          projectStore.addThread({
            content: threadTitle.value,
            project: project.value,
            bug: threadBug.value
          })
        ]).then(async () => {
          if (threadBug.value && selectedBugID.value && selectedBugID.value === threadBug.value.id) {
            await onBugSelected(threadBug.value)
          }

          batchChangeValues({ value: null }, threadTitle, threadBug)
          batchChangeValues({ value: false }, addThread)
        })
      })
    }

    async function onThreadReplySubmit () {
      addThreadReplyForm.value.validate().then(async (success) => {
        if (!success) {
          return
        }

        await Promise.all([
          projectStore.addThreadReply({
            content: threadReplyContent.value,
            thread_id: selectedThreadID.value
          })
        ]).then(async () => {
          await onSelectedThread(selectedThreadID.value)

          batchChangeValues({ value: null }, threadReplyContent)
          batchChangeValues({ value: false }, addThreadReply)
        })
      })
    }

    async function onSelectedThread (threadID) {
      selectedThreadID.value = threadID

      if (threadID !== null) {
        await Promise.all([
          projectStore.getThreadReplies({
            thread_id: threadID,
            bug_id: selectedBugID.value,
            project_id: project.value.id
          })
        ])
      } else {
        for (const threadId of Object.keys(allThreads.value)) {
          allThreads.value[threadId] = false
        }
      }
    }

    async function getBugDetails () {
      const id = selectedBugID.value
      await Promise.allSettled([
        projectStore.getBugThreads({
          id
        }),
        projectStore.getBugComments({
          id
        }),
        projectStore.getAuditTrails({
          object_id: id,
          object_class: 'Bug'
        })
      ])
      updateBugBadges.value = selectedBug.value.badges
    }

    async function onBugSelected (bug) {
      updateBugContent.value = bug.content
      updateBugStatus.value = bug.status
      updateBugPriority.value = bug.priority
      updateBugAllocatedUsers.value = bug.allocated_to
      updateBugBadges.value = bug.badges
      selectedBugID.value = bug.id
      threadBug.value = bug

      batchChangeValues({ value: null }, selectedThreadID)
      await getBugDetails()
    }

    async function onBugUpdateSubmit () {
      updateBugForm.value.validate().then(async (success) => {
        if (!success) {
          return
        }

        await projectStore.updateBug({
          id: selectedBugID.value,
          content: updateBugContent.value,
          status: updateBugStatus.value,
          priority: updateBugPriority.value,
          allocatedUserIDS: updateBugAllocatedUsers.value.map(entry => entry.id),
          badges: updateBugBadges.value
        })
        await getBugDetails()
      })
    }

    function onRowDeselect () {
      batchChangeValues({ value: null }, selectedBugID, selectedThreadID, threadBug)
    }

    async function selectedBugs (selectedValues) {
      if (!userStore.is_authenticated) {
        needToBeAuthenticated()
        return
      }

      const ids = selectedValues.map(selectedValue => selectedValue.id)
      await projectStore.bulkCloseBugs({
        ids
      })
    }

    function batchChangeValues ({ value }, ...valuesToNullify) {
      for (const state of valuesToNullify) {
        state.value = value
      }
    }

    return {
      projectStore,
      userStore,

      statuses,
      priorities,

      isLoadingProject,
      projectStatus,
      projectPriority,
      projectName,
      projectClients,
      projectClient,
      projectBadges,
      project,

      addBug,
      bugContent,
      bugStatus,
      bugPriority,
      bugAllocatedUsers,

      updateBugContent,
      updateBugStatus,
      updateBugPriority,
      updateBugAllocatedUsers,
      updateBugBadges,

      addComment,
      commentDescription,
      commentBug,

      colors,
      allBadges,
      addBadge,
      addBadgeForm,
      addBadgeTargetType,
      addBadgeTargetID,
      addBadgeLabel,
      addBadgeColor,

      addThread,
      addThreadForm,
      threadTitle,
      threadBug,
      selectedThread,
      selectedThreadID,
      allThreads,

      addThreadReply,
      addThreadReplyForm,
      threadReplyContent,

      addBugForm,
      updateBugForm,
      projectUpdateForm,
      addCommentForm,

      currentTab,
      selectedBugID,
      selectedBug,
      currentBugTab,

      onProjectSubmit,
      onBugSubmit,
      onBugUpdateSubmit,
      onCommentSubmit,
      onThreadSubmit,
      onThreadReplySubmit,
      onSubmitBadge,

      getStatusColour,
      getPriorityColour,
      flipStatus (object) {
        if (!userStore.is_authenticated) {
          needToBeAuthenticated()
          return
        }

        switch (object.constructor) {
          case Models.Project:{
            switch (projectStatus.value) {
              case 'Open': projectStatus.value = 'Closed'; break
              case 'Closed': projectStatus.value = 'Open'; break
            }
            onProjectSubmit()
            break
          }
          case Models.Bug:{
            switch (updateBugStatus.value) {
              case 'Open': updateBugStatus.value = 'Closed'; break
              case 'Closed': updateBugStatus.value = 'Open'; break
            }
            onBugUpdateSubmit()
            break
          }
        }
      },
      flipPriority (object) {
        if (!userStore.is_authenticated) {
          needToBeAuthenticated()
          return
        }

        switch (object.constructor) {
          case Models.Project:{
            switch (projectPriority.value) {
              case 'High': projectPriority.value = 'Medium'; break
              case 'Medium': projectPriority.value = 'Low'; break
              case 'Low': projectPriority.value = 'High'; break
            }
            onProjectSubmit()
            break
          }
          case Models.Bug:{
            switch (updateBugPriority.value) {
              case 'High': updateBugPriority.value = 'Medium'; break
              case 'Medium': updateBugPriority.value = 'Low'; break
              case 'Low': updateBugPriority.value = 'High'; break
            }
            onBugUpdateSubmit()
            break
          }
        }
      },
      setBadgeTarget (object) {
        if (!userStore.is_authenticated) {
          needToBeAuthenticated()
          return
        }

        switch (object.constructor) {
          case Models.Project:{
            addBadgeTargetType.value = 'Project'
            addBadgeTargetID.value = project.value.id
            break
          }
          case Models.Bug: {
            addBadgeTargetType.value = 'Bug'
            addBadgeTargetID.value = selectedBug.value.id
            break
          }
        }

        addBadge.value = true
      },
      colorLabel (color) {
        const colorReplaced = color.replace('-', ' ')
        return (colorReplaced.charAt(0).toUpperCase() + colorReplaced.slice(1))
      },
      createDocumentUploadURL (category, categoryId) {
        return `http://127.0.0.1:8000/api/v1/projects/documents/upload/?category=${category}&category_id=${categoryId}`
      },
      download (selectedDocuments) {
        const { public_path, original_name } = selectedDocuments[0] // eslint-disable-line
        fetch(`http://127.0.0.1:8000${public_path}`).then(response => response.blob()) // eslint-disable-line
          .then(blob => {
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = original_name // eslint-disable-line
            link.click()
          })
          .catch(console.error)
      },

      onBugSelected,
      onSelectedThread,
      onRowDeselect,

      sortByDate,

      selectedBugs
    }
  },
  components: {
    AuthenticatedDialog,
    TableComponent,
    GenericDetailPage
  }
})
</script>
