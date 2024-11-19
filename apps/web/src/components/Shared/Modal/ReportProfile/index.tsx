import SingleAccount from "@components/Shared/SingleAccount";
import errorToast from "@helpers/errorToast";
import { Leafwatch } from "@helpers/leafwatch";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Errors } from "@hey/data/errors";
import { PROFILE } from "@hey/data/tracking";
import stopEventPropagation from "@hey/helpers/stopEventPropagation";
import type { Profile } from "@hey/lens";
import { useReportProfileMutation } from "@hey/lens";
import {
  Button,
  Card,
  EmptyState,
  ErrorMessage,
  Form,
  TextArea,
  useZodForm
} from "@hey/ui";
import type { FC } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useProfileStatus } from "src/store/non-persisted/useProfileStatus";
import { object, string, type z } from "zod";
import Reason from "./Reason";

const reportReportProfileSchema = object({
  additionalComments: string().max(260, {
    message: "Additional comments should not exceed 260 characters"
  })
});

interface ReportProfileProps {
  profile: null | Profile;
}

const ReportProfile: FC<ReportProfileProps> = ({ profile }) => {
  const { isSuspended } = useProfileStatus();
  const [type, setType] = useState("");
  const [subReason, setSubReason] = useState("");

  const form = useZodForm({
    schema: reportReportProfileSchema
  });

  const [
    createReport,
    { data: submitData, error: submitError, loading: submitLoading }
  ] = useReportProfileMutation({
    onCompleted: () => {
      Leafwatch.track(PROFILE.REPORT, { profile_id: profile?.id });
    }
  });

  const reportProfile = async ({
    additionalComments
  }: z.infer<typeof reportReportProfileSchema>) => {
    if (isSuspended) {
      return toast.error(Errors.Suspended);
    }

    try {
      return await createReport({
        variables: {
          request: {
            additionalComments,
            for: profile?.id,
            reason: {
              [type]: {
                reason: type.replace("Reason", "").toUpperCase(),
                subreason: subReason
              }
            }
          }
        }
      });
    } catch (error) {
      errorToast(error);
    }
  };

  return (
    <div onClick={stopEventPropagation}>
      {submitData?.reportProfile === null ? (
        <EmptyState
          hideCard
          icon={<CheckCircleIcon className="size-14" />}
          message="Profile reported"
        />
      ) : profile ? (
        <div className="p-5">
          <Card className="p-3">
            <SingleAccount
              hideFollowButton
              hideUnfollowButton
              profile={profile as Profile}
              showUserPreview={false}
            />
          </Card>
          <div className="divider my-5" />
          <Form className="space-y-4" form={form} onSubmit={reportProfile}>
            {submitError ? (
              <ErrorMessage error={submitError} title="Failed to report" />
            ) : null}
            <Reason
              setSubReason={setSubReason}
              setType={setType}
              subReason={subReason}
              type={type}
            />
            {subReason ? (
              <>
                <TextArea
                  label="Description"
                  placeholder="Please provide additional details"
                  {...form.register("additionalComments")}
                />
                <Button
                  className="flex w-full justify-center"
                  disabled={submitLoading}
                  type="submit"
                >
                  Report
                </Button>
              </>
            ) : null}
          </Form>
        </div>
      ) : null}
    </div>
  );
};

export default ReportProfile;
